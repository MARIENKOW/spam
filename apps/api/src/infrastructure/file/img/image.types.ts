export type ImageProcessingConfig =
    | { mode: "original" } // сохранить как есть
    | { mode: "webp"; quality?: number } // конвертировать в WebP
    | {
          // WebP + ресайз
          mode: "webp-resize";
          width: number;
          height: number;
          fit?: "cover" | "contain" | "inside" | "outside" | "fill";
          quality?: number;
      };
