import { AppController } from "@/modules/app/app.controller";
import { AppService } from "@/modules/app/app.service";
import { I18nModule, CookieResolver, I18nContext } from "nestjs-i18n";
import { CoreModule } from "@/modules/core/core.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { defaultLanguage } from "@myorg/shared/i18n";
import { TsI18nLoader } from "@/lib/i18n/i18n.loader";
import { RequestContextMiddleware } from "@/common/request-context/request-context.middleware";
import { RequestContextModule } from "@/common/request-context/request-context.module";
import { AuthUserModule } from "@/modules/auth/user/auth.user.module";
import { AuthAdminModule } from "@/modules/auth/admin/auth.admin.module";
import { ChangePasswordUserModule } from "@/modules/user/ChangePasswordCode/changePassword.user.module";
import { ChangePasswordAdminModule } from "@/modules/admin/ChangePasswordCode/changePassword.admin.module";
import { BlogModule } from "@/modules/blog/blog.module";
import { BlogImageModule } from "@/modules/blog/image/blogImage.module";
import { BlogVideoModule } from "@/modules/blog/video/blogVideo.module";
import { FileModule } from "@/infrastructure/file/file.module";
import { AdminInvitationModule } from "@/modules/admin/invitation/adminInvitation.module";
import { AdminManagementModule } from "@/modules/admin/management/adminManagement.module";
import { UserManagementModule } from "@/modules/admin/userManagement/userManagement.module";
import { TgAccountModule } from "@/modules/tg-account/tg-account.module";
@Module({
    imports: [
        CoreModule,
        AuthUserModule,
        AuthAdminModule,
        ChangePasswordUserModule,
        ChangePasswordAdminModule,
        RequestContextModule,
        FileModule,
        AdminInvitationModule,
        AdminManagementModule,
        UserManagementModule,
        BlogImageModule,
        BlogVideoModule,
        BlogModule,
        TgAccountModule,
        I18nModule.forRoot({
            loaderOptions: {},
            fallbackLanguage: defaultLanguage,
            loader: TsI18nLoader,
            resolvers: [new CookieResolver(["NEXT_LOCALE"])],
            throwOnMissingKey: true,
        }),
    ],

    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes("*path");
    }
}
