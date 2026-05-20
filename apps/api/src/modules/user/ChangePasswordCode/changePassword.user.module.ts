import { Module } from "@nestjs/common";
import { OtpService } from "../../../infrastructure/otp/otp.service";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { ChangePasswordUserController } from "@/modules/user/ChangePasswordCode/changePassword.user.controller";
import { ChangePasswordUserService } from "@/modules/user/ChangePasswordCode/changePassword.user.service";
import { HashService } from "@/infrastructure/hash/hash.service";

@Module({
    imports: [PrismaModule, MailerModule],
    controllers: [ChangePasswordUserController],
    providers: [ChangePasswordUserService, OtpService, HashService],
})
export class ChangePasswordUserModule {}
