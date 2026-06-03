import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common";
import { Auth, CurrentActor } from "@/modules/auth/decorators/auth.decorator";
import { AdminActor } from "@/modules/auth/auth.type";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { TgMessengerService } from "./tg-messenger.service";
import {
    MessengerAccountDialogsDto,
    MessengerMessageDto,
    MessengerSendDto,
} from "@myorg/shared/dto";

const { path } = FULL_PATH_ENDPOINT.tgMessenger;

@Controller(path)
export class TgMessengerController {
    constructor(private readonly messenger: TgMessengerService) {}

    @Get("dialogs")
    @Auth("ADMIN")
    async getDialogs(
        @CurrentActor() actor: AdminActor,
    ): Promise<MessengerAccountDialogsDto[]> {
        return this.messenger.getDialogs(actor.admin.id);
    }

    @Get("dialogs/:dialogId/messages")
    @Auth("ADMIN")
    async getMessages(
        @Param("dialogId") dialogId: string,
        @Query("accountId") accountId: string,
        @Query("limit", new DefaultValuePipe(30), ParseIntPipe) limit: number,
        @Query("offsetId", new DefaultValuePipe(0), ParseIntPipe) offsetId: number,
        @CurrentActor() actor: AdminActor,
    ): Promise<MessengerMessageDto[]> {
        return this.messenger.getMessages(accountId, dialogId, actor.admin.id, limit, offsetId);
    }

    @Post("messages")
    @Auth("ADMIN")
    async sendMessage(
        @Body() body: MessengerSendDto,
        @CurrentActor() actor: AdminActor,
    ): Promise<void> {
        return this.messenger.sendMessage(body.accountId, body.dialogId, body.text, actor.admin.id);
    }
}
