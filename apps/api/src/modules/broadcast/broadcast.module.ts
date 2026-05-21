import { Module } from "@nestjs/common";
import { PrismaModule } from "@/infrastructure/prisma/prisma.module";
import { BroadcastService } from "@/modules/broadcast/broadcast.service";
import { BroadcastTgService } from "@/modules/broadcast/broadcast.tg.service";
import { BroadcastWorker } from "@/modules/broadcast/broadcast.worker";
import { BroadcastController } from "@/modules/broadcast/broadcast.controller";

@Module({
    imports: [PrismaModule],
    providers: [BroadcastService, BroadcastTgService, BroadcastWorker],
    controllers: [BroadcastController],
    exports: [BroadcastService],
})
export class BroadcastModule {}
