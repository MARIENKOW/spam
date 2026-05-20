import { RequestContextService } from "@/common/request-context/request-context.service";
import { AdminModule } from "@/modules/admin/admin.module";
import { SessionAdminModule } from "@/modules/auth/admin/session/session.admin.module";
import { AuthGuard } from "@/modules/auth/auth.guard";
import { SessionUserModule } from "@/modules/auth/user/session/session.user.module";
import { UserModule } from "@/modules/user/user.module";
import { Global, Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";

@Global()
@Module({
    imports: [SessionUserModule, UserModule, SessionAdminModule, AdminModule],
    providers: [
        Reflector,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class CoreModule {}
