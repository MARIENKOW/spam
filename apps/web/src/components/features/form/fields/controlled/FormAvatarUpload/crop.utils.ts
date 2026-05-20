export interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function getCroppedBlob(
    imageSrc: string,
    pixelCrop: CropArea,
    rotation: number,
): Promise<Blob> {
    const image = await loadImage(imageSrc);

    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    // Размер который вмещает повёрнутое изображение целиком
    const rotatedWidth = Math.round(image.width * cos + image.height * sin);
    const rotatedHeight = Math.round(image.width * sin + image.height * cos);

    // 1. Рисуем повёрнутое изображение на temp-canvas
    const rotCanvas = document.createElement("canvas");
    rotCanvas.width = rotatedWidth;
    rotCanvas.height = rotatedHeight;

    const rotCtx = rotCanvas.getContext("2d")!;
    rotCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotCtx.rotate(rad);
    rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

    // 2. Вырезаем pixelCrop из повёрнутого canvas
    // react-easy-crop отдаёт координаты в пространстве повёрнутого изображения
    const MAX_SIZE = 512;
    const outputWidth = Math.min(pixelCrop.width, MAX_SIZE);
    const outputHeight = Math.min(pixelCrop.height, MAX_SIZE);

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = outputWidth;
    cropCanvas.height = outputHeight;

    const cropCtx = cropCanvas.getContext("2d")!;
    cropCtx.drawImage(
        rotCanvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight,
    );

    return toBlob(cropCanvas);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", reject);
        img.src = src;
    });
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob ? resolve(blob) : reject(new Error("Canvas is empty")),
            "image/jpeg",
            0.95,
        );
    });
}
