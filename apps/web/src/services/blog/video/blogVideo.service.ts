import { PagedResult, VideoDto } from "@myorg/shared/dto";
import { FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const { path, upload } = FULL_PATH_ENDPOINT.blog.video;

export default class BlogVideoService {
    upload: (
        { video }: { video: File },
        options: AxiosRequestConfig,
    ) => Promise<AxiosResponse<VideoDto>>;
    delete: (id: string) => Promise<AxiosResponse<void>>;
    getAll: ({
        page,
    }: {
        page: number;
    }) => Promise<AxiosResponse<PagedResult<VideoDto>>>;
    deleteAll: () => Promise<AxiosResponse<{ skipped: number }>>;
    constructor(api: AxiosInstance) {
        this.upload = async (body, options) => {
            const { data } = await api.get<{ uploadToken: string }>(
                upload.path,
            );
            return await api.post<VideoDto>(
                upload.path + "?" + `uploadToken=${data.uploadToken}`,
                body,
                options,
            );
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
            const res = await api.get<PagedResult<VideoDto>>(newPath);
            return res;
        };
        this.deleteAll = async () => {
            return await api.delete<{ skipped: number }>(path);
        };
    }
}
