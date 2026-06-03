import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { SessionAdminModule } from "@/modules/auth/admin/session/session.admin.module";
import { AdminModule } from "@/modules/admin/admin.module";
import { TgMessengerService } from "./tg-messenger.service";
import { TgMessengerController } from "./tg-messenger.controller";
import { TgMessengerGateway } from "./tg-messenger.gateway";

@Module({
    imports: [PrismaModule, SessionAdminModule, AdminModule],
    providers: [TgMessengerService, TgMessengerGateway],
    controllers: [TgMessengerController],
})
export class TgMessengerModule {}
