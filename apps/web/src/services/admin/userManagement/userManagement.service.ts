import { UserManagementDto, PagedResult, SessionUserViewDto } from "@myorg/shared/dto";
import { ENDPOINT, FULL_PATH_ENDPOINT } from "@myorg/shared/endpoints";
import { FetchCustom, FetchCustomReturn } from "@/utils/api";
import { UserParams } from "@/lib/tanstack/listDefaults";
import { toSearchParams } from "@/utils/toSearchParams";
import { UpdateNoteUserManagementDtoOutput } from "@myorg/shared/form";

const { path } = FULL_PATH_ENDPOINT.admin.users;
const { block, activate, note, sessions } = ENDPOINT.admin.users;

const JSON_HEADERS = { "Content-Type": "application/json" };

export default class UserManagementService {
    getAll: (params: UserParams) => FetchCustomReturn<PagedResult<UserManagementDto>>;
    block: (id: string) => FetchCustomReturn<UserManagementDto>;
    activate: (id: string) => FetchCustomReturn<UserManagementDto>;
    delete: (id: string) => FetchCustomReturn<void>;
    getSessions: (id: string) => FetchCustomReturn<SessionUserViewDto[]>;
    deleteSession: (userId: string, sessionId: string) => FetchCustomReturn<void>;
    deleteAllSessions: (id: string) => FetchCustomReturn<void>;
    updateNote: (id: string, body: UpdateNoteUserManagementDtoOutput) => FetchCustomReturn<UserManagementDto>;

    constructor(api: FetchCustom) {
        this.getAll = (params) => {
            const query = toSearchParams(params);
            return api<PagedResult<UserManagementDto>>(`${path}?${query}`, { method: "GET" });
        };

        this.block = (id) =>
            api<UserManagementDto>(`${path}/${id}/${block.path}`, { method: "PATCH" });

        this.activate = (id) =>
            api<UserManagementDto>(`${path}/${id}/${activate.path}`, { method: "PATCH" });

        this.delete = (id) =>
            api<void>(`${path}/${id}`, { method: "DELETE" });

        this.getSessions = (id) =>
            api<SessionUserViewDto[]>(`${path}/${id}/${sessions.path}`, { method: "GET" });

        this.deleteSession = (userId, sessionId) =>
            api<void>(`${path}/${userId}/${sessions.path}/${sessionId}`, { method: "DELETE" });

        this.deleteAllSessions = (id) =>
            api<void>(`${path}/${id}/${sessions.path}`, { method: "DELETE" });

        this.updateNote = (id, body) =>
            api<UserManagementDto>(`${path}/${id}/${note.path}`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: JSON_HEADERS,
            });
    }
}
