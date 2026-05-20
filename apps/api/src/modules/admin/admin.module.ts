import { AdminService } from "@/modules/admin/admin.service";
import { SessionAdminModule } from "@/modules/auth/admin/session/session.admin.module";
import { HashService } from "@/infrastructure/hash/hash.service";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { AdminController } from "@/modules/admin/admin.controller";
import { Module } from "@nestjs/common";
import { ImageModule } from "@/infrastructure/file/img/image.module";

@Module({
    imports: [PrismaModule, SessionAdminModule, ImageModule],
    providers: [AdminService, HashService],
    controllers: [AdminController],
    exports: [AdminService],
})
export class AdminModule {}
