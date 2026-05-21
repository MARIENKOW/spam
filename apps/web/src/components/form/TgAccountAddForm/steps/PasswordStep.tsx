"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import LockIcon from "@mui/icons-material/Lock";
import { useTranslations } from "next-intl";
import SimpleForm from "@/components/wrappers/form/SimpleForm";
import FormPassword from "@/components/features/form/fields/controlled/FormPassword";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { StyledAlert } from "@/components/ui/StyledAlert";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { TgAccountVerifySchema, TgAccountVerifyInput } from "@myorg/shared/form";

interface Props {
    phone: string;
    phoneCodeHash: string;
    code: string;
    onSuccess: () => void;
}

const service = new TgAccountService($apiAdminClient);

export default function PasswordStep({ phone, phoneCodeHash, code, onSuccess }: Props) {
    const t = useTranslations();

    return (
        <SimpleForm<TgAccountVerifyInput>
            params={{
                resolver: zodResolver(TgAccountVerifySchema),
                defaultValues: { phone, phoneCodeHash, code, password: "" },
            }}
            onSubmit={async (values, { setError }) => {
                try {
                    await service.authVerify({ phone, phoneCodeHash, code, password: values.password });
                    onSuccess();
                } catch (error) {
                    errorFormHandlerWithAlert<TgAccountVerifyInput>({
                        error, setError, formValues: values, t,
                    });
                }
            }}
        >
            <StyledAlert severity="info" icon={<LockIcon fontSize="small" />}>
                {t("pages.admin.tgAccounts.add.hints.password")}
            </StyledAlert>
            <FormPassword<TgAccountVerifyInput>
                name="password"
                label="form.tgAccount.password.label"
            />
            <FormAlert />
            <SubmitButton />
        </SimpleForm>
    );
}
