// src/mailer/mailer.service.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import nodemailer from "nodemailer";
import { I18nService } from "nestjs-i18n";
import { MessageStructure } from "@myorg/shared/i18n";
import { env } from "@/config";
import i18nFormatDuration from "@/lib/i18n/i18nFormatDuration";

export interface SendForgotPasswordOptions {
    to: string;
    url: string;
    expires: number;
}

@Injectable()
export class MailerService implements OnModuleInit {
    private transporter!: nodemailer.Transporter; // ← Вот так
    private readonly logger = new Logger(MailerService.name);

    constructor(private i18n: I18nService<MessageStructure>) {}

    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            // debug: true,
            // logger: true,
            secure: true,
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD,
            },
            pool: true,

            maxConnections: 5,
            maxMessages: 100,
            // Rate limit
            rateDelta: 1000 * 60, // 1 min
            rateLimit: 10,
        });
        this.transporter.verify().then(
            () => this.logger.log("SMTP ready"),
            (data) => {
                this.logger.error(data);
            },
        );
    }

    async sendForgotPassword({ to, expires, url }: SendForgotPasswordOptions) {
        const html = `
            <!DOCTYPE html >
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial;">
            <h2>${this.i18n.t("mail.resetPassword.title")}</h2>
            <p><a href="${url}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">${this.i18n.t("mail.resetPassword.button")}</a></p>
            <hr>
            <p>${this.i18n.t("mail.resetPassword.expires", { args: { time: i18nFormatDuration(expires) } })}</p>
            </body>
            </html>`;
        await this.transporter.sendMail({
            from: env.SMTP_USER,
            to,
            subject: this.i18n.t("mail.resetPassword.text"),
            html,
            text: `${this.i18n.t("mail.resetPassword.button")}: ${url}`,
        });
    }
    async sendActivateToken({ to, url, expires }: SendForgotPasswordOptions) {
        const html = `
            <!DOCTYPE html >
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial;">
            <h2>${this.i18n.t("mail.activate.title")}</h2>
            <p><a href="${url}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">${this.i18n.t("mail.activate.button")}</a></p>
            <hr>
            <p>${this.i18n.t("mail.activate.expires", { args: { time: i18nFormatDuration(expires) } })}</p>
            </body>
            </html>`;
        await this.transporter.sendMail({
            from: env.SMTP_USER,
            to,
            subject: this.i18n.t("mail.activate.text"),
            html,
            text: `${this.i18n.t("mail.activate.button")}: ${url}`,
        });
    }
    async sendAdminInvitation({
        to,
        url,
        expires,
    }: SendForgotPasswordOptions) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial;">
            <h2>${this.i18n.t("mail.adminInvitation.title")}</h2>
            <p>${this.i18n.t("mail.adminInvitation.description")}</p>
            <p><a href="${url}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">${this.i18n.t("mail.adminInvitation.button")}</a></p>
            <hr>
            <p>${this.i18n.t("mail.adminInvitation.expires", { args: { time: i18nFormatDuration(expires) } })}</p>
            <p style="color:#888;font-size:12px;">${this.i18n.t("mail.adminInvitation.ignore")}</p>
            </body>
            </html>`;
        await this.transporter.sendMail({
            from: env.SMTP_USER,
            to,
            subject: this.i18n.t("mail.adminInvitation.subject"),
            html,
            text: `${this.i18n.t("mail.adminInvitation.button")}: ${url}`,
        });
    }

    async sendChangePasswordCode({
        to,
        code,
        expires,
    }: {
        to: string;
        code: string;
        expires: number;
    }) {
        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial;">
        <h2>${this.i18n.t("mail.changePassword.title")}</h2>
        <p>${this.i18n.t("mail.changePassword.description")}</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 24px;background:#f5f5f5;border-radius:8px;display:inline-block;margin:8px 0;">
            ${code}
        </div>
        <hr>
        <p>${this.i18n.t("mail.changePassword.expires", { args: { time: i18nFormatDuration(expires) } })}</p>
        <p style="color:#888;font-size:12px;">${this.i18n.t("mail.changePassword.ignore")}</p>
        </body>
        </html>`;

        await this.transporter.sendMail({
            from: env.SMTP_USER,
            to,
            subject: this.i18n.t("mail.changePassword.subject"),
            html,
            text: `${this.i18n.t("mail.changePassword.subject")}: ${code}`,
        });
    }
}
