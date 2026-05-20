import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { AdminInvitationController } from "@/modules/admin/invitation/adminInvitation.controller";
import { AdminInvitationService } from "@/modules/admin/invitation/adminInvitation.service";
import { AdminInvitationAcceptController } from "@/modules/admin/invitation/adminInvitationAccept.controller";
import { AdminInvitationAcceptService } from "@/modules/admin/invitation/adminInvitationAccept.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { RequestContextModule } from "@/common/request-context/request-context.module";

@Module({
    imports: [PrismaModule, MailerModule, RequestContextModule],
    controllers: [AdminInvitationController, AdminInvitationAcceptController],
    providers: [AdminInvitationService, AdminInvitationAcceptService, HashService],
})
export class AdminInvitationModule {}
