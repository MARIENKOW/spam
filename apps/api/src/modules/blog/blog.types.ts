import { Prisma } from "@/generated/prisma";

export type BlogWithImage = Prisma.BlogGetPayload<{
    include: {
        image: true;
        bodyImages: { select: { id: true } };
        bodyVideos: { select: { id: true } };
    };
}>;
