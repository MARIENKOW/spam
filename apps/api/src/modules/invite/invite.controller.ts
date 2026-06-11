import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    NotFoundException,
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
    AddInviteChannelOutput,
    AddInviteChannelSchema,
    SearchChannelOutput,
    SearchChannelSchema,
    SetInviteTargetChannelOutput,
    SetInviteTargetChannelSchema,
    UpdateInviteDelayOutput,
    UpdateInviteDelaySchema,
} from "@myorg/shared/form";
import {
    ChannelSearchResultDto,
    InviteDto,
    InviteProgressDto,
    InviteRecipientDto,
    InviteRunDto,
    InviteRunRecipientDto,
    PagedResult,
} from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { InviteService } from "@/modules/invite/invite.service";
import { InviteTgService } from "@/modules/invite/invite.tg.service";
import { InviteWorker } from "@/modules/invite/invite.worker";

@Controller(`${FULL_PATH_ENDPOINT.tgAccount.path}/:accountId/invite`)
@Auth("ADMIN")
export class InviteController {
    private readonly logger = new Logger(InviteController.name);

    constructor(
        private readonly inviteService: InviteService,
        private readonly inviteTg: InviteTgService,
        private readonly worker: InviteWorker,
    ) {}

    @Get()
    async get(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getOrCreate(accountId);
    }

    @Patch("target-channel")
    async setTargetChannel(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(SetInviteTargetChannelSchema)) body: SetInviteTargetChannelOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.setTargetChannel(accountId, body);
    }

    @Patch("delay")
    async updateDelay(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(UpdateInviteDelaySchema)) body: UpdateInviteDelayOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.updateDelaySettings(accountId, body.delayBaseSeconds, body.delayJitterSeconds);
    }

    @Post("channels/search")
    async searchChannels(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(SearchChannelSchema)) body: SearchChannelOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<ChannelSearchResultDto[]> {
        await this.assertAccess(accountId, actor);
        return this.inviteTg.searchChannels(accountId, body.query);
    }

    @Post("channels")
    async addChannel(
        @Param("accountId") accountId: string,
        @Body(new ZodValidationPipe(AddInviteChannelSchema)) body: AddInviteChannelOutput,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.inviteService.addChannel(accountId, body);

        const invite = await this.inviteService.findByAccountOrFail(accountId);
        const channel = result.channels.find((c) => c.telegramId === body.telegramId);
        if (channel) {
            this.inviteTg
                .fetchChannelRecipients(accountId, invite.id, channel.id, body.telegramId)
                .catch((err) => {
                    this.logger.warn(`Failed to fetch recipients for channel ${body.telegramId}: ${err.message}`);
                    this.inviteService.updateChannelFetchError(channel.id, err.message).catch(() => {});
                });
        }

        return result;
    }

    @Delete("channels/:channelId")
    async removeChannel(
        @Param("accountId") accountId: string,
        @Param("channelId") channelId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.removeChannel(accountId, channelId);
    }

    @Post("channels/:channelId/fetch-recipients")
    async fetchRecipients(
        @Param("accountId") accountId: string,
        @Param("channelId") channelId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<{ count: number }> {
        await this.assertAccess(accountId, actor);
        const invite = await this.inviteService.findByAccountOrFail(accountId);
        const channel = await this.inviteService.findChannel(invite.id, channelId);
        if (!channel) throw new NotFoundException("channel.notFound");

        try {
            const count = await this.inviteTg.fetchChannelRecipients(
                accountId,
                invite.id,
                channelId,
                channel.telegramId,
            );
            return { count };
        } catch (err: any) {
            await this.inviteService.updateChannelFetchError(channelId, err.message).catch(() => {});
            throw err;
        }
    }

    @Get("progress")
    async getProgress(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteProgressDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getProgress(accountId);
    }

    @Get("progress/recipients")
    async getRecipients(
        @Param("accountId") accountId: string,
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query("status") status: string | undefined,
        @CurrentActor() actor: AdminActor,
    ): Promise<PagedResult<InviteRecipientDto>> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getRecipients(accountId, page, limit, status);
    }

    @Get("history")
    async getHistory(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteRunDto[]> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getHistory(accountId);
    }

    @Get("history/:runId")
    async getRun(
        @Param("accountId") accountId: string,
        @Param("runId") runId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteRunDto> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getRun(accountId, runId);
    }

    @Get("history/:runId/recipients")
    async getRunRecipients(
        @Param("accountId") accountId: string,
        @Param("runId") runId: string,
        @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query("status") status: string | undefined,
        @CurrentActor() actor: AdminActor,
    ): Promise<PagedResult<InviteRunRecipientDto>> {
        await this.assertAccess(accountId, actor);
        return this.inviteService.getRunRecipients(accountId, runId, page, limit, status);
    }

    @Delete("history/:runId")
    async deleteRun(
        @Param("accountId") accountId: string,
        @Param("runId") runId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        await this.assertAccess(accountId, actor);
        await this.inviteService.deleteRun(accountId, runId);
    }

    @Delete("history")
    async deleteAllRuns(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        await this.assertAccess(accountId, actor);
        await this.inviteService.deleteAllRuns(accountId);
    }

    @Post("start")
    async start(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.inviteService.start(accountId);
        this.worker.schedule(result.id, 0);
        return result;
    }

    @Post("stop")
    async stop(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        const invite = await this.inviteService.findByAccountOrFail(accountId);
        this.worker.cancel(invite.id);
        return this.inviteService.stop(accountId);
    }

    @Post("reset")
    async reset(
        @Param("accountId") accountId: string,
        @CurrentActor() actor: AdminActor,
    ): Promise<InviteDto> {
        await this.assertAccess(accountId, actor);
        const result = await this.inviteService.resetForNewRun(accountId);

        const invite = await this.inviteService.findByAccountOrFail(accountId);
        for (const channel of result.channels) {
            this.inviteTg
                .fetchChannelRecipients(accountId, invite.id, channel.id, channel.telegramId)
                .catch((err) =>
                    this.logger.warn(`Failed to re-fetch recipients for channel ${channel.telegramId}: ${err.message}`),
                );
        }

        return result;
    }

    private assertAccess(accountId: string, actor: AdminActor): Promise<void> {
        return this.inviteService.assertAccountAccess(accountId, actor.admin.id, actor.role);
    }
}
