import { HashService } from "../src/infrastructure/hash/hash.service";
import { env } from "../src/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";

const adapter = new PrismaPg({ connectionString: env.DB_URL });
const prisma = new PrismaClient({ adapter });

const hash = new HashService();

async function main() {
    const existing = await prisma.admin.findFirst({
        where: { role: "SUPERADMIN" },
    });

    if (existing) {
        console.log("✅ Superadmin already exists, skipping");
        return;
    }

    if (!env.SUPERADMIN_PASSWORD || !env.SUPERADMIN_EMAIL) {
        console.error("❌ Ошибка валидации env-переменных:");
        process.exit(1);
    }

    const passwordHash = await hash.hash(env.SUPERADMIN_PASSWORD);

    await prisma.admin.create({
        data: {
            email: env.SUPERADMIN_EMAIL,
            passwordHash,
            role: "SUPERADMIN",
            status: "ACTIVE",
            updatedAt: new Date(),
        },
    });

    console.log(`✅ Superadmin created: ${env.SUPERADMIN_EMAIL}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
