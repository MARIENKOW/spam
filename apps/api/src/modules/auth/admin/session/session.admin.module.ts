import { SessionAdminService } from "@/modules/auth/admin/session/session.admin.service";
import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaService } from "@/infrastructure/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SessionAdminController } from "@/modules/auth/admin/session/session.admin.controller";

@Module({
    providers: [SessionAdminService, PrismaService, JwtService, HashService],
    exports: [SessionAdminService],
    controllers: [SessionAdminController],
})
export class SessionAdminModule {}
