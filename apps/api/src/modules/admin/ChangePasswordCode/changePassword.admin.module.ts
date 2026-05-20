import { Module } from "@nestjs/common";
import { OtpService } from "../../../infrastructure/otp/otp.service";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { HashService } from "@/infrastructure/hash/hash.service";
import { ChangePasswordAdminController } from "@/modules/admin/ChangePasswordCode/changePassword.admin.controller";
import { ChangePasswordAdminService } from "@/modules/admin/ChangePasswordCode/changePassword.admin.service";

@Module({
    imports: [PrismaModule, MailerModule],
    controllers: [ChangePasswordAdminController],
    providers: [ChangePasswordAdminService, OtpService, HashService],
})
export class ChangePasswordAdminModule {}
