import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/config";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger("Prisma");
    constructor() {
        const connectionString = env.DB_URL;
        const adapter = new PrismaPg({ connectionString });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect().then(
            () => this.logger.log("Prisma connect"),
            (data) => {
                this.logger.error(data);
            },
        );
    }

    async onModuleDestroy() {
        await this.$disconnect().then(
            () => this.logger.log("Prisma disconnect"),
            (data) => {
                this.logger.error(data);
            },
        );
    }
}
