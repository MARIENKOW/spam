"use client";

import { useState } from "react";
import { Box, Collapse } from "@mui/material";
import Step1 from "@/components/form/admin/ChangePasswordSettings/steps/Step1";
import Step1WithoutPassword from "./steps/Step1WithoutPassword";
import { MailSendSuccess } from "@myorg/shared/dto";
import Step2 from "@/components/form/admin/ChangePasswordSettings/steps/Step2";
import ChangePasswordStepper from "@/components/form/admin/ChangePasswordSettings/ui/Stepper.admin";

type Step = 0 | 1;

interface ChangePasswordFormProps {
    initialMailSendSuccess: MailSendSuccess | null;
    withoutPassword: boolean;
}

export default function ChangePasswordForm({
    initialMailSendSuccess,
    withoutPassword,
}: ChangePasswordFormProps) {
    const [step, setStep] = useState<Step>(initialMailSendSuccess ? 1 : 0);
    const [mailSendSuccess, setMailSendSuccess] = useState<MailSendSuccess>(
        initialMailSendSuccess ?? {
            email: "",
            expiresAt: new Date(0).toISOString(),
            cooldownUntil: null,
        },
    );

    const handleStep1Success = (success: MailSendSuccess) => {
        setMailSendSuccess(success);
        setStep(1);
    };

    const handleCancel = () => setStep(0);

    return (
        <Box>
            <Box mb={7}>
                <ChangePasswordStepper activeStep={step} />
            </Box>
            <Box width={"100%"} maxWidth={400} mx={"auto"}>
                <Collapse in={step === 0} unmountOnExit>
                    {withoutPassword ? (
                        <Step1WithoutPassword onSuccess={handleStep1Success} />
                    ) : (
                        <Step1 onSuccess={handleStep1Success} />
                    )}
                </Collapse>

                <Collapse in={step === 1} unmountOnExit>
                    <Step2
                        mailSendSuccess={mailSendSuccess}
                        setMailSendSuccess={setMailSendSuccess}
                        onCancel={handleCancel}
                    />
                </Collapse>
            </Box>
        </Box>
    );
}
