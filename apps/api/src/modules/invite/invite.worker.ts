import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { InviteService } from "@/modules/invite/invite.service";
import { InviteTgService } from "@/modules/invite/invite.tg.service";

const INVITE_DELAY_BASE_MS = 3 * 60 * 1000;
const INVITE_DELAY_RANDOM_MS = 60 * 1000;
const FLOOD_WAIT_BUFFER_MS = 2_000;
const INVITE_MAX_TRANSIENT_RETRIES = 3;
const TRANSIENT_RETRY_BASE_MS = 30 * 1000;

function isFloodWait(err: any): boolean {
    return err?.className === "FloodWaitError" || err?.code === 420;
}

// Per-recipient permanent errors — retrying this user will never help
const PERMANENT_RECIPIENT_ERRORS = new Set([
    "USER_PRIVACY_RESTRICTED",
    "USER_NOT_MUTUAL_CONTACT",
    "USER_CHANNELS_TOO_MUCH",
    "USER_BLOCKED",
    "USER_KICKED",
    "USER_ID_INVALID",
    "INPUT_USER_DEACTIVATED",
    "USER_BOT",
    // Account/channel-level errors — no point retrying the same user
    "PEER_FLOOD",
    "USERS_TOO_MUCH",
    "CHAT_ADMIN_REQUIRED",
    "CHANNEL_PRIVATE",
    "USER_BANNED_IN_CHANNEL",
    "BOTS_TOO_MUCH",
    "CHANNEL_INVALID",
    "CHAT_WRITE_FORBIDDEN",
]);

function randomDelay(): number {
    return INVITE_DELAY_BASE_MS + Math.floor(Math.random() * INVITE_DELAY_RANDOM_MS);
}

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
export class InviteWorker implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(InviteWorker.name);
    private readonly activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly transientRetries = new Map<string, number>();

    constructor(
        private readonly inviteService: InviteService,
        private readonly tg: InviteTgService,
    ) {}

    onModuleInit(): void {
        this.resumeRunningInvites();
    }

    onModuleDestroy(): void {
        for (const timeout of this.activeTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.activeTimeouts.clear();
    }

    schedule(inviteId: string, delayMs = 0): void {
        this.cancelIfActive(inviteId);

        const timeout = setTimeout(async () => {
            await this.processNext(inviteId);
        }, delayMs);

        this.activeTimeouts.set(inviteId, timeout);
    }

    cancel(inviteId: string): void {
        this.cancelIfActive(inviteId);
    }

    private async processNext(inviteId: string): Promise<void> {
        this.activeTimeouts.delete(inviteId);

        const invite = await this.inviteService.getInviteById(inviteId);
        if (!invite || invite.status !== "RUNNING") return;

        const recipient = await this.inviteService.getNextPendingRecipient(inviteId);

        if (!recipient) {
            await this.inviteService.markCompleted(inviteId);
            this.logger.log(`Invite ${inviteId} completed`);
            return;
        }

        if (!recipient.accessHash || !invite.targetChannelTelegramId || !invite.targetChannelAccessHash) {
            await this.inviteService.markRecipientFailed(
                recipient.id,
                "Missing access hash or target channel — re-fetch recipients and try again",
            );
            this.logger.warn(`Invite ${inviteId}: skipped ${recipient.userId} — missing data`);
            await this.continueOrFinish(inviteId, 0);
            return;
        }

        const delayMs = randomDelay();

        // Isolate the API call so a DB-write failure can't masquerade as an invite failure
        let apiError: any = null;
        try {
            await this.tg.inviteToChannel(
                invite.tgAccountId,
                invite.targetChannelTelegramId,
                invite.targetChannelAccessHash,
                recipient.userId,
                recipient.accessHash,
            );
        } catch (err: any) {
            apiError = err;
        }

        if (apiError) {
            const msg: string = apiError.errorMessage ?? "";

            // FloodWait — record the error but keep recipient PENDING for retry
            if (isFloodWait(apiError)) {
                const floodDelayMs = (apiError.seconds ?? 60) * 1000 + FLOOD_WAIT_BUFFER_MS;
                await this.inviteService.noteRecipientError(
                    recipient.id,
                    `FLOOD_WAIT ${apiError.seconds}s`,
                    serializeError(apiError),
                );
                this.logger.warn(`Invite ${inviteId}: flood wait ${apiError.seconds}s — rescheduling`);
                this.schedule(inviteId, floodDelayMs);
                return;
            }

            // Already a member — counts as success
            if (msg === "USER_ALREADY_PARTICIPANT") {
                await this.inviteService.markRecipientSent(recipient.id);
                this.logger.log(`Invite ${inviteId}: ${recipient.userId} already in channel — marked sent`);
                await this.continueOrFinish(inviteId, delayMs);
                return;
            }

            // Channel requires join approval or membership could not be verified
            if (msg === "INVITE_REQUEST_SENT" || msg === "USER_NOT_PARTICIPANT_AFTER_INVITE") {
                await this.inviteService.markRecipientFailed(
                    recipient.id,
                    "Channel requires join approval — user was not added",
                    serializeError(apiError),
                );
                this.logger.warn(`Invite ${inviteId}: ${recipient.userId} — channel requires approval`);
                await this.continueOrFinish(inviteId, delayMs);
                return;
            }

            // Known permanent per-recipient failures — no point retrying
            if (PERMANENT_RECIPIENT_ERRORS.has(msg)) {
                await this.inviteService.markRecipientFailed(recipient.id, msg, serializeError(apiError));
                this.logger.warn(`Invite ${inviteId}: ${recipient.userId} — ${msg}`);
                await this.continueOrFinish(inviteId, delayMs);
                return;
            }

            // Unknown/transient error — retry with linear backoff up to the limit
            const attempts = (this.transientRetries.get(recipient.id) ?? 0) + 1;
            if (attempts <= INVITE_MAX_TRANSIENT_RETRIES) {
                this.transientRetries.set(recipient.id, attempts);
                const retryMs = TRANSIENT_RETRY_BASE_MS * attempts;
                this.logger.warn(`Invite ${inviteId}: transient error (try ${attempts}) — ${apiError.message}`);
                this.schedule(inviteId, retryMs);
                return;
            }

            this.transientRetries.delete(recipient.id);
            await this.inviteService.markRecipientFailed(
                recipient.id,
                apiError.message ?? "Unknown error",
                serializeError(apiError),
            );
            this.logger.error(`Invite ${inviteId}: giving up on ${recipient.userId} — ${apiError.message}`);
            await this.continueOrFinish(inviteId, delayMs);
            return;
        }

        // Invite succeeded — DB write is separate so its failure doesn't mark the recipient failed
        this.transientRetries.delete(recipient.id);
        try {
            await this.inviteService.markRecipientSent(recipient.id);
            this.logger.log(`Invite ${inviteId}: invited ${recipient.userId}`);
        } catch (dbErr: any) {
            // Telegram side succeeded; log the desync but don't mark the user as failed
            this.logger.error(
                `Invite ${inviteId}: sent but DB write failed for ${recipient.userId}`,
                dbErr,
            );
        }

        await this.continueOrFinish(inviteId, delayMs);
    }

    private async continueOrFinish(inviteId: string, delayMs: number): Promise<void> {
        if (await this.inviteService.hasPendingRecipients(inviteId)) {
            this.schedule(inviteId, delayMs);
        } else {
            await this.inviteService.markCompleted(inviteId);
            this.logger.log(`Invite ${inviteId} completed`);
        }
    }

    private async resumeRunningInvites(): Promise<void> {
        try {
            const running = await this.inviteService.getAllRunning();
            for (const invite of running) {
                this.logger.log(`Resuming invite ${invite.id}`);
                this.schedule(invite.id, 0);
            }
        } catch (err) {
            this.logger.error("Failed to resume running invites", err);
        }
    }

    private cancelIfActive(inviteId: string): void {
        const existing = this.activeTimeouts.get(inviteId);
        if (existing) {
            clearTimeout(existing);
            this.activeTimeouts.delete(inviteId);
        }
    }
}
