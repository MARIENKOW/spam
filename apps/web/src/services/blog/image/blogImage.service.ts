import { ImageDto, PagedResult } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const { path, upload } = FULL_PATH_ENDPOINT.blog.image;

export default class BlogImageService {
    upload: (
        { image }: { image: File },
        options: AxiosRequestConfig,
    ) => Promise<AxiosResponse<ImageDto>>;
    delete: (id: string) => Promise<AxiosResponse<void>>;
    getAll: ({
        page,
        limit,
    }: {
        page: number;
        limit?: number;
    }) => Promise<AxiosResponse<PagedResult<ImageDto>>>;
    deleteAll: () => Promise<AxiosResponse<{ skipped: number }>>;
    constructor(api: AxiosInstance) {
        this.upload = async (body, options) => {
            return await api.post<ImageDto>(upload.path, body, options);
        };
        this.delete = async (id) => {
            return await api.delete<void>(path + "/" + id);
        };
        this.getAll = async (body) => {
            const search = new URLSearchParams();

            for (const [key, value] of Object.entries(body)) {
                if (value !== undefined && value !== null) {
                    search.append(key, String(value));
                }
            }

            const query = search.toString();
            const newPath = query ? `${path}?${query}` : path;
            const res = await api.get<PagedResult<ImageDto>>(newPath);
            return res;
        };
        this.deleteAll = async () => {
            return await api.delete<{ skipped: number }>(path);
        };
    }
}
