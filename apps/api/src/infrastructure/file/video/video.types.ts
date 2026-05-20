import { Prisma } from "@/generated/prisma";
/**
 * Общие опции качества для режимов транскодирования.
 *
 * crf    — Constant Rate Factor (0–51). Меньше = лучше, больше файл.
 *          Предпочтительнее фиксированного битрейта: ffmpeg сам управляет
 *          битрейтом в зависимости от сложности сцены.
 * preset — баланс скорость / степень сжатия.
 */
type TranscodeOptions = {
    crf?: number;
    audioBitrate?: string;
    preset?:
        | "ultrafast"
        | "superfast"
        | "veryfast"
        | "faster"
        | "fast"
        | "medium"
        | "slow";
};

export type VideoWithImage = Prisma.VideoGetPayload<{
    include: { image: true };
}>;

export type VideoProcessingConfig =
    | { mode: "original" }
    | ({ mode: "mp4" } & TranscodeOptions)
    | ({
          mode: "mp4-resize";
          width: number;
          height: number;
          /**
           * crop    — обрезает до точного размера (как cover у sharp)
           * pad     — вписывает с чёрными полосами (как contain)
           * stretch — растягивает без сохранения пропорций (как fill)
           */
          fit?: "crop" | "pad" | "stretch";
      } & TranscodeOptions);
