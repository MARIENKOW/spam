"use client";

import { useState } from "react";
import { Box, Collapse } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { tgAccountKeys } from "@/lib/tanstack/keys";
import TgAccountStepper from "./TgAccountAddForm/ui/TgAccountStepper";
import PhoneStep from "./TgAccountAddForm/steps/PhoneStep";
import CodeStep from "./TgAccountAddForm/steps/CodeStep";
import PasswordStep from "./TgAccountAddForm/steps/PasswordStep";

type Step = 0 | 1 | 2;

export default function TgAccountAddForm() {
    const t = useTranslations();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<Step>(0);
    const [phone, setPhone] = useState("");
    const [phoneCodeHash, setPhoneCodeHash] = useState("");
    const [code, setCode] = useState("");

    const afterSuccess = async () => {
        snackbarSuccess(t("pages.admin.tgAccounts.feedback.added"));
        queryClient.invalidateQueries({ queryKey: tgAccountKeys.all });
        router.push(FULL_PATH_ROUTE.admin.tgAccounts.path);
    };

    const handlePhoneSuccess = ({
        phone: p,
        phoneCodeHash: h,
    }: {
        phone: string;
        phoneCodeHash: string;
    }) => {
        setPhone(p);
        setPhoneCodeHash(h);
        setStep(1);
    };

    const handleRequires2FA = (verifiedCode: string) => {
        setCode(verifiedCode);
        setStep(2);
    };

    return (
        <Box display={"flex"} flexDirection={"column"} flex={1}>
            <Box mb={7}>
                <TgAccountStepper activeStep={step} />
            </Box>

            <Box
                display={"flex"}
                flexDirection={"column"}
                flex={1}
                width="100%"
                pt={{ xs: 10, sm: 0 }}
                justifyContent={{ xs: "start", sm: "center" }}
                maxWidth={400}
                mx="auto"
            >
                <Collapse in={step === 0} unmountOnExit>
                    <PhoneStep onSuccess={handlePhoneSuccess} />
                </Collapse>

                <Collapse in={step === 1} unmountOnExit>
                    <CodeStep
                        phone={phone}
                        phoneCodeHash={phoneCodeHash}
                        onSuccess={afterSuccess}
                        onRequires2FA={handleRequires2FA}
                    />
                </Collapse>

                <Collapse in={step === 2} unmountOnExit>
                    <PasswordStep
                        phone={phone}
                        phoneCodeHash={phoneCodeHash}
                        code={code}
                        onSuccess={afterSuccess}
                    />
                </Collapse>
            </Box>
        </Box>
    );
}
