export type UploadStatus = "waiting" | "uploading" | "done" | "error" | "cancelled";

export interface UploadItem {
    id: string;
    file: File;
    status: UploadStatus;
    progress: number;
    speed: number;
}

export interface UploadProgressEvent {
    loaded: number;
    total: number;
}

export type UploadFn<TResult = unknown> = (
    file: File,
    options: {
        signal: AbortSignal;
        onProgress: (event: UploadProgressEvent) => void;
    },
) => Promise<TResult>;

export interface UploaderProps<TResult = unknown> {
    uploadFn: UploadFn<TResult>;
    onSuccess?: (result: TResult, item: UploadItem) => void;
    onError?: (error: unknown, item: UploadItem) => void;
    accept?: string[];
}
