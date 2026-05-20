import { AdminModule } from "@/modules/admin/admin.module";
import { HashService } from "@/infrastructure/hash/hash.service";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";

import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import ResetPasswordTokenAdminController from "@/modules/auth/admin/resetPasswordToken/reset.password.token.admin.controller";
import { ResetPasswordTokenAdminService } from "@/modules/auth/admin/resetPasswordToken/reset.password.token.admin.service";

@Module({
    imports: [PrismaModule, AdminModule, MailerModule],
    providers: [ResetPasswordTokenAdminService, HashService, JwtService],
    controllers: [ResetPasswordTokenAdminController],
    exports: [ResetPasswordTokenAdminService],
})
export class ResetPasswordTokenAdminModule {}
