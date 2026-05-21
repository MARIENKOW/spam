import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { BroadcastService } from "@/modules/broadcast/broadcast.service";
import { BroadcastTgService } from "@/modules/broadcast/broadcast.tg.service";

const SEND_DELAY_BASE_MS = 3 * 60 * 1000;       // 3 minutes
const SEND_DELAY_RANDOM_MS = 60 * 1000;          // up to +1 minute
const FLOOD_WAIT_BUFFER_MS = 2_000;              // extra buffer after flood wait

function randomDelay(): number {
    return SEND_DELAY_BASE_MS + Math.floor(Math.random() * SEND_DELAY_RANDOM_MS);
}

@Injectable()
export class BroadcastWorker implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(BroadcastWorker.name);
    private readonly activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

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

    // ── Public API ────────────────────────────────────────────────────────────

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

    // ── Core loop ─────────────────────────────────────────────────────────────

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
            this.schedule(broadcastId, 0);
            return;
        }

        let delayMs = randomDelay();

        try {
            await this.tg.sendMessage(
                broadcast.tgAccountId,
                recipient.userId,
                recipient.accessHash,
                broadcast.message,
            );
            await this.broadcastService.markRecipientSent(recipient.id);
            this.logger.log(`Broadcast ${broadcastId}: sent to ${recipient.userId}`);
        } catch (err: any) {
            // Telegram flood wait — respect the required delay
            if (err.errorMessage === "FLOOD_WAIT" && err.seconds) {
                const floodDelayMs = err.seconds * 1000 + FLOOD_WAIT_BUFFER_MS;
                this.logger.warn(
                    `Broadcast ${broadcastId}: flood wait ${err.seconds}s — rescheduling`,
                );
                this.schedule(broadcastId, floodDelayMs);
                return;
            }

            await this.broadcastService.markRecipientFailed(recipient.id, err.message ?? "Unknown error");
            this.logger.warn(`Broadcast ${broadcastId}: failed for ${recipient.userId} — ${err.message}`);
        }

        // Complete immediately if no more pending recipients, otherwise schedule next
        const hasMore = await this.broadcastService.hasPendingRecipients(broadcastId);
        if (!hasMore) {
            await this.broadcastService.markCompleted(broadcastId);
            this.logger.log(`Broadcast ${broadcastId} completed`);
            return;
        }

        this.schedule(broadcastId, delayMs);
    }

    // ── Resume on startup ─────────────────────────────────────────────────────

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

    // ── Private ───────────────────────────────────────────────────────────────

    private cancelIfActive(broadcastId: string): void {
        const existing = this.activeTimeouts.get(broadcastId);
        if (existing) {
            clearTimeout(existing);
            this.activeTimeouts.delete(broadcastId);
        }
    }
}
