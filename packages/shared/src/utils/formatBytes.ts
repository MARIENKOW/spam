const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * Переводит байты в человекочитаемый размер.
 *
 * @example
 * formatBytes(0)               // "0 B"
 * formatBytes(1024)            // "1 KB"
 * formatBytes(1536)            // "1.5 KB"
 * formatBytes(5 * 1024 * 1024) // "5 MB"
 * formatBytes(1_500_000_000)   // "1.4 GB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
    if (bytes < 0) throw new RangeError("formatBytes: bytes must be >= 0");
    if (bytes === 0) return `0 ${UNITS[0]}`;

    const base = 1024;
    const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(base)),
        UNITS.length - 1,
    );

    const value = bytes / Math.pow(base, unitIndex);

    // Убираем лишние нули: 5.0 → "5", 1.5 → "1.5"
    const formatted = parseFloat(value.toFixed(decimals));

    return `${formatted} ${UNITS[unitIndex]}`;
}
