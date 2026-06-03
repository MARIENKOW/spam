import { Logger, OnModuleInit } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { TgClientManagerService } from "@/modules/tg-client-manager/tg-client-manager.service";
import { SessionAdminService } from "@/modules/auth/admin/session/session.admin.service";
import { AdminService } from "@/modules/admin/admin.service";
import { MessengerNewMessageEvent } from "@myorg/shared/dto";
import { env } from "@/config";

function parseCookieHeader(header: string): Record<string, string> {
    return Object.fromEntries(
        header.split(";").map((c) => {
            const idx = c.indexOf("=");
            if (idx === -1) return [c.trim(), ""];
            return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())];
        }),
    );
}

@WebSocketGateway({ cors: { origin: env.ALLOWED_ORIGIN, credentials: true }, namespace: "/messenger" })
export class TgMessengerGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(TgMessengerGateway.name);

    constructor(
        private readonly manager: TgClientManagerService,
        private readonly sessionAdmin: SessionAdminService,
        private readonly admin: AdminService,
    ) {}

    onModuleInit(): void {
        this.manager.events.on("message.new", (adminId: string, payload: MessengerNewMessageEvent) => {
            this.server.to(`admin:${adminId}`).emit("message.new", payload);
        });
    }

    async handleConnection(socket: Socket): Promise<void> {
        try {
            const cookieHeader = socket.handshake.headers.cookie ?? "";
            const cookies = parseCookieHeader(cookieHeader);
            const token = cookies.accessTokenAdmin;
            if (!token) { socket.disconnect(); return; }

            let payload: { adminId: string; sessionId: string };
            try {
                payload = this.sessionAdmin.verifyAccessToken(token);
            } catch {
                socket.disconnect(); return;
            }

            const session = await this.sessionAdmin.findById(payload.sessionId);
            if (!session) { socket.disconnect(); return; }

            const adminEntity = await this.admin.findById(session.adminId);
            if (!adminEntity || adminEntity.status !== "ACTIVE") { socket.disconnect(); return; }

            socket.data.adminId = adminEntity.id;
            socket.join(`admin:${adminEntity.id}`);
        } catch (err: any) {
            this.logger.warn(`WS connection error: ${err.message}`);
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket): void {
        this.logger.debug(`Socket disconnected: ${socket.id}`);
    }
}
