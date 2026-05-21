import { FileEntityType } from "@/generated/prisma";
import { FileEntityConfig } from "./file.types";
import path from "path";

export const UPLOADS_ROOT = "uploads";
export const UPLOADS_BASE_PATH = path.resolve(process.cwd(), UPLOADS_ROOT);
export const TMP_PATH = path.resolve(process.cwd(), UPLOADS_ROOT + "/tmp");

export const FILE_CONFIG: Record<FileEntityType, FileEntityConfig> = {
    [FileEntityType.AVATAR]: { folder: "avatars", private: false },
    [FileEntityType.BLOG_IMAGE]: {
        folder: "blog/image",
        private: false,
    },
    [FileEntityType.BLOG_VIDEO]: {
        folder: "blog/video",
        private: false,
    },
    [FileEntityType.BLOG_MAIN_IMAGE]: {
        folder: "blog/main-image",
        private: false,
    },
    [FileEntityType.TG_ACCOUNT_PHOTO]: {
        folder: "tg-accounts",
        private: false,
    },
};

export const FILE_PUBLIC: FileEntityConfig[] = Object.entries(FILE_CONFIG)
    .map((e) => e[1])
    .filter((e) => !e.private);
