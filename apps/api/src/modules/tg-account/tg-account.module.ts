import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { ImageModule } from "@/infrastructure/file/img/image.module";
import { TgAccountService } from "@/modules/tg-account/tg-account.service";
import { TgAccountController } from "@/modules/tg-account/tg-account.controller";

@Module({
    imports: [PrismaModule, ImageModule],
    providers: [TgAccountService],
    controllers: [TgAccountController],
    exports: [TgAccountService],
})
export class TgAccountModule {}
