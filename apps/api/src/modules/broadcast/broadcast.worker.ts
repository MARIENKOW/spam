import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { BroadcastService } from "@/modules/broadcast/broadcast.service";
import { BroadcastTgService } from "@/modules/broadcast/broadcast.tg.service";

const DEFAULT_DELAY_SECONDS = 180;
const FLOOD_WAIT_BUFFER_MS = 2_000;
const MAX_TRANSIENT_RETRIES = 3;
const TRANSIENT_RETRY_BASE_MS = 30 * 1000;

function isFloodWait(err: any): boolean {
    return err?.className === "FloodWaitError" || err?.code === 420;
}

// Per-recipient permanent errors — retrying this user will never help
const PERMANENT_RECIPIENT_ERRORS = new Set([
    "USER_PRIVACY_RESTRICTED",
    "USER_IS_BLOCKED",
    "USER_BLOCKED",
    "YOU_BLOCKED_USER",
    "USER_DEACTIVATED",
    "USER_DEACTIVATED_BAN",
    "INPUT_USER_DEACTIVATED",
    "USER_ID_INVALID",
    "PEER_ID_INVALID",
    "USER_IS_BOT",
    "CHAT_WRITE_FORBIDDEN",
    // Account-level — no point retrying the same user
    "PEER_FLOOD",
]);

function serializeError(err: any): Record<string, unknown> {
    return {
        name: err.name,
        message: err.message,
        errorMessage: err.errorMessage,
        code: err.code,
        seconds: err.seconds,
    };
}

@Injectable()
export class BroadcastWorker implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(BroadcastWorker.name);
    private readonly activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly transientRetries = new Map<string, number>();

    constructor(
        private readonly broadcastService: BroadcastService,
        private readonly tg: BroadcastTgService,
    ) {}

    onModuleInit(): void {
        this.resumeRunningBroadcasts();
    }

    onModuleDestroy(): void {
        for (const timeout of this.activeTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.activeTimeouts.clear();
    }

    schedule(broadcastId: string, delayMs = 0): void {
        this.cancelIfActive(broadcastId);

        const timeout = setTimeout(async () => {
            await this.processNext(broadcastId);
        }, delayMs);

        this.activeTimeouts.set(broadcastId, timeout);
    }

    cancel(broadcastId: string): void {
        this.cancelIfActive(broadcastId);
    }

    private async processNext(broadcastId: string): Promise<void> {
        this.activeTimeouts.delete(broadcastId);

        const broadcast = await this.broadcastService.getBroadcastById(broadcastId);
        if (!broadcast || broadcast.status !== "RUNNING") return;

        const recipient = await this.broadcastService.getNextPendingRecipient(broadcastId);

        if (!recipient) {
            await this.broadcastService.markCompleted(broadcastId);
            this.logger.log(`Broadcast ${broadcastId} completed`);
            return;
        }

        if (!recipient.accessHash) {
            await this.broadcastService.markRecipientFailed(
                recipient.id,
                "Missing access hash — re-fetch channel recipients and start a new broadcast",
            );
            this.logger.warn(`Broadcast ${broadcastId}: skipped ${recipient.userId} — no access hash`);
            await this.continueOrFinish(broadcastId);
            return;
        }

        // Isolate the API call so a DB-write failure can't masquerade as a send failure
        let apiError: any = null;
        try {
            await this.tg.sendMessage(
                broadcast.tgAccountId,
                recipient.userId,
                recipient.accessHash,
                broadcast.message,
            );
        } catch (err: any) {
            apiError = err;
        }

        if (apiError) {
            const msg: string = apiError.errorMessage ?? "";

            // FloodWait — record the error but keep recipient PENDING for retry
            if (isFloodWait(apiError)) {
                const floodDelayMs = (apiError.seconds ?? 60) * 1000 + FLOOD_WAIT_BUFFER_MS;
                await this.broadcastService.noteRecipientError(
                    recipient.id,
                    `FLOOD_WAIT ${apiError.seconds}s`,
                    serializeError(apiError),
                );
                this.logger.warn(`Broadcast ${broadcastId}: flood wait ${apiError.seconds}s — rescheduling`);
                await this.reschedule(broadcastId, floodDelayMs);
                return;
            }

            // Known permanent per-recipient failures — no point retrying
            if (PERMANENT_RECIPIENT_ERRORS.has(msg)) {
                await this.broadcastService.markRecipientFailed(recipient.id, msg, serializeError(apiError));
                this.logger.warn(`Broadcast ${broadcastId}: ${recipient.userId} — ${msg}`);
                await this.continueOrFinish(broadcastId);
                return;
            }

            // Unknown/transient error — retry with linear backoff up to the limit
            const attempts = (this.transientRetries.get(recipient.id) ?? 0) + 1;
            if (attempts <= MAX_TRANSIENT_RETRIES) {
                this.transientRetries.set(recipient.id, attempts);
                const retryMs = TRANSIENT_RETRY_BASE_MS * attempts;
                this.logger.warn(`Broadcast ${broadcastId}: transient error (try ${attempts}) — ${apiError.message}`);
                await this.reschedule(broadcastId, retryMs);
                return;
            }

            this.transientRetries.delete(recipient.id);
            await this.broadcastService.markRecipientFailed(
                recipient.id,
                apiError.message ?? "Unknown error",
                serializeError(apiError),
            );
            this.logger.error(`Broadcast ${broadcastId}: giving up on ${recipient.userId} — ${apiError.message}`);
            await this.continueOrFinish(broadcastId);
            return;
        }

        // Send succeeded — DB write is separate so its failure doesn't mark the recipient failed
        this.transientRetries.delete(recipient.id);
        try {
            await this.broadcastService.markRecipientSent(recipient.id);
            this.logger.log(`Broadcast ${broadcastId}: sent to ${recipient.userId}`);
        } catch (dbErr: any) {
            this.logger.error(
                `Broadcast ${broadcastId}: sent but DB write failed for ${recipient.userId}`,
                dbErr,
            );
        }

        await this.continueOrFinish(broadcastId);
    }

    private async continueOrFinish(broadcastId: string): Promise<void> {
        const next = await this.broadcastService.getNextPendingRecipient(broadcastId);
        if (!next) {
            await this.broadcastService.markCompleted(broadcastId);
            this.logger.log(`Broadcast ${broadcastId} completed`);
            return;
        }
        const delayMs = (next.delaySeconds ?? DEFAULT_DELAY_SECONDS) * 1000;
        await this.reschedule(broadcastId, delayMs);
    }

    // Persists the real next-attempt time (so the UI can show an accurate ETA) and schedules
    // the next tick after the given delay.
    private async reschedule(broadcastId: string, delayMs: number): Promise<void> {
        const nextAttemptAt = new Date(Date.now() + delayMs);
        try {
            await this.broadcastService.updateSchedule(broadcastId, nextAttemptAt);
        } catch (err) {
            this.logger.warn(`Broadcast ${broadcastId}: failed to persist schedule`, err as any);
        }
        this.schedule(broadcastId, delayMs);
    }

    private async resumeRunningBroadcasts(): Promise<void> {
        try {
            const running = await this.broadcastService.getAllRunning();
            for (const broadcast of running) {
                this.logger.log(`Resuming broadcast ${broadcast.id}`);
                this.schedule(broadcast.id, 0);
            }
        } catch (err) {
            this.logger.error("Failed to resume running broadcasts", err);
        }
    }

    private cancelIfActive(broadcastId: string): void {
        const existing = this.activeTimeouts.get(broadcastId);
        if (existing) {
            clearTimeout(existing);
            this.activeTimeouts.delete(broadcastId);
        }
    }
}
