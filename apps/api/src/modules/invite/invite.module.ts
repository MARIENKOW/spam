import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { InviteService } from "@/modules/invite/invite.service";
import { InviteTgService } from "@/modules/invite/invite.tg.service";
import { InviteWorker } from "@/modules/invite/invite.worker";
import { InviteController } from "@/modules/invite/invite.controller";

@Module({
    imports: [PrismaModule],
    providers: [InviteService, InviteTgService, InviteWorker],
    controllers: [InviteController],
    exports: [InviteService],
})
export class InviteModule {}
