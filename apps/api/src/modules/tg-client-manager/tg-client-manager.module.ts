import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { TgClientManagerService } from "./tg-client-manager.service";

@Global()
@Module({
    imports: [PrismaModule],
    providers: [TgClientManagerService],
    exports: [TgClientManagerService],
})
export class TgClientManagerModule {}
