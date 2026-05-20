import { Module } from "@nestjs/common";
import { AuthAdminController } from "@/modules/auth/admin/auth.admin.controller";
import { AuthAdminService } from "@/modules/auth/admin/auth.admin.service";
import { AdminModule } from "@/modules/admin/admin.module";
import { HashService } from "@/infrastructure/hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { SessionAdminModule } from "@/modules/auth/admin/session/session.admin.module";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { ResetPasswordTokenAdminModule } from "@/modules/auth/admin/resetPasswordToken/reset.password.token.admin.module";

@Module({
    imports: [
        AdminModule,
        ResetPasswordTokenAdminModule,
        SessionAdminModule,
        MailerModule,
    ],
    providers: [AuthAdminService, HashService, OAuth2Client, JwtService],
    controllers: [AuthAdminController],
    exports: [AuthAdminService],
})
export class AuthAdminModule {}
