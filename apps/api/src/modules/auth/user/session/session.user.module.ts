import { SessionUserService } from "@/modules/auth/user/session/session.user.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SessionUserController } from "@/modules/auth/user/session/session.user.controller";

@Module({
    providers: [SessionUserService, PrismaService, JwtService, HashService],
    exports: [SessionUserService],
    controllers: [SessionUserController],
})
export class SessionUserModule {}
