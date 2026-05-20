import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { UserManagementController } from "@/modules/admin/userManagement/userManagement.controller";
import { UserManagementService } from "@/modules/admin/userManagement/userManagement.service";
import { UserModule } from "@/modules/user/user.module";

@Module({
    imports: [PrismaModule, UserModule],
    controllers: [UserManagementController],
    providers: [UserManagementService],
})
export class UserManagementModule {}
