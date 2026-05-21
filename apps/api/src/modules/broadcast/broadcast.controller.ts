import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { Logger } from "@nestjs/common";
import { AdminActor } from "@/modules/auth/auth.type";
import { ZodValidationPipe } from "@/common/pipe/zod-validation";
import {
    AddBroadcastChannelOutput,
    AddBroadcastChannelSchema,
    SearchChannelOutput,
    SearchChannelSchema,
    UpdateBroadcastMessageOutput,
    UpdateBroadcastMessageSchema,
} from "@myorg/shared/form";
import {
    BroadcastDto,
    BroadcastProgressDto,
    BroadcastRecipientDto,
    BroadcastRunDto,
    BroadcastRunRecipientDto,
    ChannelSearchResultDto,
    PagedResult,
} from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { BroadcastService } from "@/modules/broadcast/broadcast.service";
import { BroadcastTgService } from "@/modules/broadcast/broadcast.tg.service";
import { BroadcastWorker } from "@/modules/broadcast/broadcast.worker";

const { broadcast: broadcastPath } = FULL_PATH_ENDPOINT.tgAccount;

@Controller(`${FULL_PATH_ENDPOINT.tgAccount.path}/:accountId/broadcast`)
@Auth("ADMIN")
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name);

    constructor(
        private readonly broadcastService: BroadcastService,
        private readonly broadcastTg: BroadcastTgService,
        private readonly worker: BroadcastWorker,
    ) {}

    @Get()
    async get(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.getOrCreate(accountId);
    }

    @Patch("message")
    async updateMessage(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(UpdateBroadcastMessageSchema)) body: UpdateBroadcastMessageOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.updateMessage(accountId, body.message);
    }

    @Post("channels/search")
    async searchChannels(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(SearchChannelSchema)) body: SearchChannelOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<ChannelSearchResultDto[]> {
        await this.assertAccess(accountId, actor);
        return this.broadcastTg.searchChannels(accountId, body.query);
    }

    @Post("channels")
    async addChannel(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(AddBroadcastChannelSchema)) body: AddBroadcastChannelOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.broadcastService.addChannel(accountId, body);

        // Kick off recipient fetch in background — response returns immediately
        const broadcast = await this.broadcastService.findByAccountOrFail(accountId);
        const channel = result.channels.find((c) => c.telegramId === body.telegramId);
        if (channel) {
            this.broadcastTg
                .fetchChannelRecipients(accountId, broadcast.id, channel.id, body.telegramId)
                .catch((err) =>
                    this.logger.warn(`Failed to fetch recipients for channel ${body.telegramId}: ${err.message}`),
                );
        }

        return result;
    }

    @Delete("channels/:channelId")
    async removeChannel(
        @Param("accountId") accountId: string,
        @Param("channelId") channelId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.removeChannel(accountId, channelId);
    }

    @Post("channels/:channelId/fetch-recipients")
    async fetchRecipients(
        @Param("accountId") accountId: string,
        @Param("channelId") channelId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<{ count: number }> {
        await this.assertAccess(accountId, actor);
        const broadcast = await this.broadcastService.findByAccountOrFail(accountId);
        const full = await this.broadcastService.getOrCreate(accountId);
        const channel = full.channels.find((c) => c.id === channelId);
        if (!channel) throw new Error("channel.notFound");

        const count = await this.broadcastTg.fetchChannelRecipients(
            accountId,
            broadcast.id,
            channelId,
            channel.telegramId,
        );
        return { count };
    }

    @Get("progress")
    async getProgress(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastProgressDto> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.getProgress(accountId);
    }

    @Get("progress/recipients")
    async getRecipients(
        @Param("accountId") accountId: string,
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query("status") status: string | undefined,
        @CurrentActor() actor: AdminActor,
    ): Promise<PagedResult<BroadcastRecipientDto>> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.getRecipients(accountId, page, limit, status);
    }

    @Get("history")
    async getHistory(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastRunDto[]> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.getHistory(accountId);
    }

    @Get("history/:runId/recipients")
    async getRunRecipients(
        @Param("accountId") accountId: string,
        @Param("runId") runId: string,
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query("status") status: string | undefined,
        @CurrentActor() actor: AdminActor,
    ): Promise<PagedResult<BroadcastRunRecipientDto>> {
        await this.assertAccess(accountId, actor);
        return this.broadcastService.getRunRecipients(runId, page, limit, status);
    }

    @Delete("history/:runId")
    async deleteRun(
        @Param("accountId") accountId: string,
        @Param("runId") runId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        await this.assertAccess(accountId, actor);
        await this.broadcastService.deleteRun(runId);
    }

    @Delete("history")
    async deleteAllRuns(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        await this.assertAccess(accountId, actor);
        await this.broadcastService.deleteAllRuns(accountId);
    }

    @Post("start")
    async start(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.broadcastService.start(accountId);
        this.worker.schedule(result.id, 0);
        return result;
    }

    @Post("stop")
    async stop(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        const broadcast = await this.broadcastService.findByAccountOrFail(accountId);
        this.worker.cancel(broadcast.id);
        return this.broadcastService.stop(accountId);
    }

    @Post("reset")
    async reset(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<BroadcastDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.broadcastService.resetForNewRun(accountId);

        // Re-fetch recipients for all channels in background
        const broadcast = await this.broadcastService.findByAccountOrFail(accountId);
        for (const channel of result.channels) {
            this.broadcastTg
                .fetchChannelRecipients(accountId, broadcast.id, channel.id, channel.telegramId)
                .catch((err) =>
                    this.logger.warn(`Failed to re-fetch recipients for channel ${channel.telegramId}: ${err.message}`),
                );
        }

        return result;
    }

    // ── Access guard ──────────────────────────────────────────────────────────

    private assertAccess(accountId: string, actor: AdminActor): Promise<void> {
        return this.broadcastService.assertAccountAccess(accountId, actor.admin.id, actor.role);
    }
}
