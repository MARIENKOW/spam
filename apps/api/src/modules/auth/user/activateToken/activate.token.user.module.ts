import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { UserModule } from "@/modules/user/user.module";
import { Module } from "@nestjs/common";
import { MailerModule } from "@/infrastructure/mailer/mailer.module";
import { JwtService } from "@nestjs/jwt";
import { HashService } from "@/infrastructure/hash/hash.service";
import { ActivateTokenUserService } from "@/modules/auth/user/activateToken/activate.token.user.service";

@Module({
    imports: [PrismaModule, UserModule, MailerModule],
    providers: [ActivateTokenUserService, JwtService, HashService],
    exports: [ActivateTokenUserService],
})
export class ActivateTokenUserModule {}
