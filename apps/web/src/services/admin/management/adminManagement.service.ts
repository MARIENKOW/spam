import { AdminManagementDto, PagedResult, SessionAdminViewDto } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { AdminParams } from "@/lib/tanstack/listDefaults";
import { toSearchParams } from "@/utils/toSearchParams";
import { UpdateNoteAdminManagementDtoOutput } from "@myorg/shared/form";

const { path } = FULL_PATH_ENDPOINT.admin.admins;
const { block, unblock, note, sessions } = ENDPOINT.admin.admins;

const JSON_HEADERS = { "Content-Type": "application/json" };

export default class AdminManagementService {
    getAll: (params: AdminParams) => FetchCustomReturn<PagedResult<AdminManagementDto>>;
    block: (id: string) => FetchCustomReturn<AdminManagementDto>;
    unblock: (id: string) => FetchCustomReturn<AdminManagementDto>;
    delete: (id: string) => FetchCustomReturn<void>;
    getSessions: (id: string) => FetchCustomReturn<SessionAdminViewDto[]>;
    deleteSession: (adminId: string, sessionId: string) => FetchCustomReturn<void>;
    deleteAllSessions: (id: string) => FetchCustomReturn<void>;
    updateNote: (id: string, body: UpdateNoteAdminManagementDtoOutput) => FetchCustomReturn<AdminManagementDto>;

    constructor(api: FetchCustom) {
        this.getAll = (params) => {
            const query = toSearchParams(params);
            return api<PagedResult<AdminManagementDto>>(`${path}?${query}`, { method: "GET" });
        };

        this.block = (id) =>
            api<AdminManagementDto>(`${path}/${id}/${block.path}`, { method: "PATCH" });

        this.unblock = (id) =>
            api<AdminManagementDto>(`${path}/${id}/${unblock.path}`, { method: "PATCH" });

        this.delete = (id) =>
            api<void>(`${path}/${id}`, { method: "DELETE" });

        this.getSessions = (id) =>
            api<SessionAdminViewDto[]>(`${path}/${id}/${sessions.path}`, { method: "GET" });

        this.deleteSession = (adminId, sessionId) =>
            api<void>(`${path}/${adminId}/${sessions.path}/${sessionId}`, { method: "DELETE" });

        this.deleteAllSessions = (id) =>
            api<void>(`${path}/${id}/${sessions.path}`, { method: "DELETE" });

        this.updateNote = (id, body) =>
            api<AdminManagementDto>(`${path}/${id}/${note.path}`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: JSON_HEADERS,
            });
    }
}
