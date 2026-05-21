"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import KeyIcon from "@mui/icons-material/Key";
import { useTranslations } from "next-intl";
import SimpleForm from "@/components/wrappers/form/SimpleForm";
import FormTextField from "@/components/features/form/fields/controlled/FormTextField";
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
    onSuccess: () => void;
    onRequires2FA: (code: string) => void;
}

const service = new TgAccountService($apiAdminClient);

export default function CodeStep({ phone, phoneCodeHash, onSuccess, onRequires2FA }: Props) {
    const t = useTranslations();

    return (
        <SimpleForm<TgAccountVerifyInput>
            params={{
                resolver: zodResolver(TgAccountVerifySchema),
                defaultValues: { phone, phoneCodeHash, code: "" },
            }}
            onSubmit={async (values, { setError }) => {
                try {
                    const res = await service.authVerify({ phone, phoneCodeHash, code: values.code });
                    if (res.data.requires2FA) {
                        onRequires2FA(values.code);
                    } else {
                        onSuccess();
                    }
                } catch (error) {
                    errorFormHandlerWithAlert<TgAccountVerifyInput>({
                        error, setError, formValues: values, t,
                    });
                }
            }}
        >
            <StyledAlert severity="info" icon={<KeyIcon fontSize="small" />}>
                {t("pages.admin.tgAccounts.add.hints.code")}
            </StyledAlert>
            <FormTextField<TgAccountVerifyInput>
                name="code"
                label="form.tgAccount.code.label"
                autoFocus
            />
            <FormAlert />
            <SubmitButton />
        </SimpleForm>
    );
}
