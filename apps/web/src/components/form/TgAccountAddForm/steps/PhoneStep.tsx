"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneAndroid } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import SimpleForm from "@/components/wrappers/form/SimpleForm";
import FormTextField from "@/components/features/form/fields/controlled/FormTextField";
import SubmitButton from "@/components/features/form/SubmitButton";
import FormAlert from "@/components/features/form/FormAlert";
import { errorFormHandlerWithAlert } from "@/helpers/error/error.handler.helper";
import { StyledAlert } from "@/components/ui/StyledAlert";
import TgAccountService from "@/services/tg-account/tg-account.service";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import { TgAccountStartSchema, TgAccountStartInput } from "@myorg/shared/form";

interface Props {
    onSuccess: (result: { phone: string; phoneCodeHash: string }) => void;
}

const service = new TgAccountService($apiAdminClient);

export default function PhoneStep({ onSuccess }: Props) {
    const t = useTranslations();

    return (
        <SimpleForm<TgAccountStartInput>
            params={{
                resolver: zodResolver(TgAccountStartSchema),
                defaultValues: { phone: "" },
            }}
            onSubmit={async (values, { setError }) => {
                try {
                    const res = await service.authStart(values);
                    onSuccess({ phone: values.phone, phoneCodeHash: res.data.phoneCodeHash });
                } catch (error) {
                    errorFormHandlerWithAlert<TgAccountStartInput>({
                        error, setError, formValues: values, t,
                    });
                }
            }}
        >
            <StyledAlert severity="info" icon={<PhoneAndroid fontSize="small" />}>
                {t("pages.admin.tgAccounts.add.hints.phone")}
            </StyledAlert>
            <FormTextField<TgAccountStartInput>
                name="phone"
                label="form.tgAccount.phone.label"
                placeholder={t("form.tgAccount.phone.placeholder")}
                autoFocus
            />
            <FormAlert />
            <SubmitButton />
        </SimpleForm>
    );
}
