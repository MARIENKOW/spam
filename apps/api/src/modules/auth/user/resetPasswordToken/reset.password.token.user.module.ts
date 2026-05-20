import { HashService } from "@/infrastructure/hash/hash.service";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import ResetPasswordTokenUserController from "@/modules/auth/user/resetPasswordToken/reset.password.token.user.controller";
import { ResetPasswordTokenUserService } from "@/modules/auth/user/resetPasswordToken/reset.password.token.user.service";
import { UserModule } from "@/modules/user/user.module";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [PrismaModule, UserModule, MailerModule],
    providers: [ResetPasswordTokenUserService, HashService, JwtService],
    controllers: [ResetPasswordTokenUserController],
    exports: [ResetPasswordTokenUserService],
})
export class ResetPasswordTokenUserModule {}
