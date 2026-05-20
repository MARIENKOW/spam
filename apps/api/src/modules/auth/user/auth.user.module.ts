import { Module } from "@nestjs/common";
import { AuthUserController } from "@/modules/auth/user/auth.user.controller";
import { AuthUserService } from "@/modules/auth/user/auth.user.service";
import { UserModule } from "@/modules/user/user.module";
import { HashService } from "@/infrastructure/hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { SessionUserModule } from "@/modules/auth/user/session/session.user.module";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { ActivateTokenUserModule } from "@/modules/auth/user/activateToken/activate.token.user.module";
import { ResetPasswordTokenUserModule } from "@/modules/auth/user/resetPasswordToken/reset.password.token.user.module";

@Module({
    imports: [
        UserModule,
        ResetPasswordTokenUserModule,
        ActivateTokenUserModule,
        MailerModule,
        SessionUserModule,
    ],
    providers: [AuthUserService, HashService, OAuth2Client, JwtService],
    controllers: [AuthUserController],
    exports: [AuthUserService],
})
export class AuthUserModule {}
