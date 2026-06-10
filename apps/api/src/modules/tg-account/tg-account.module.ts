import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { ImageModule } from "@/infrastructure/file/img/image.module";
import { TgAccountService } from "@/modules/tg-account/tg-account.service";
import { TgAccountController } from "@/modules/tg-account/tg-account.controller";
import { TgOwnedChannelService } from "@/modules/tg-account/tg-owned-channel.service";

@Module({
    imports: [PrismaModule, ImageModule],
    providers: [TgAccountService, TgOwnedChannelService],
    controllers: [TgAccountController],
    exports: [TgAccountService, TgOwnedChannelService],
})
export class TgAccountModule {}
