import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { AdminModule } from "@/modules/admin/admin.module";
import { AdminManagementController } from "@/modules/admin/management/adminManagement.controller";
import { AdminManagementService } from "@/modules/admin/management/adminManagement.service";

@Module({
    imports: [PrismaModule, AdminModule],
    controllers: [AdminManagementController],
    providers: [AdminManagementService],
})
export class AdminManagementModule {}
