export interface ImageDto {
    id: string;
    url: string; // готовый URL — публичный или через /images/file/:id
    mimeType: string;
    width: number;
    height: number;
    size: number;
    uploadedBy?: string;
    createdAt: string;
}
