"use client";

import ActivateButton from "@/components/features/auth/user/ActivateButton";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { isApiErrorResponse } from "@/helpers/error/error.type.helper";
import { Box } from "@mui/material";
import { ApiErrorResponse, ErrorsWithMessages } from "@myorg/shared/dto";

import { useTranslations } from "next-intl";

type ActivateErrorProp = { error: unknown };

export default function ActivateErrorElement({ error }: ActivateErrorProp) {
    let message;
    let isShowButton = false;
    let email;
    if (isApiErrorResponse(error)) {
        const { data }: { data: ErrorsWithMessages } =
            error as ApiErrorResponse;
        message = data.root?.[0].message;
        isShowButton = data.root?.[0].data?.isShowButton;
        email = data.root?.[0].data?.email;
    }
    const t = useTranslations();
    return (
        <Box
            flex={1}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
            flexDirection={"column"}
            gap={5}
        >
            <Box display={"flex"} gap={1} flexDirection={"column"}>
                <StyledTypography textAlign={"center"} variant={"h2"}>
                    {t("feedback.error.activate.title")}
                </StyledTypography>
                <StyledTypography
                    textAlign={"center"}
                    maxWidth={700}
                    margin={"0px auto"}
                    variant={"h6"}
                >
                    {t("feedback.error.activate.subtitle")}
                </StyledTypography>
                {message && (
                    <StyledTypography
                        overflow={"hidden"}
                        textAlign={"center"}
                        variant={"body1"}
                        color="text.secondary"
                        maxWidth={700}
                        margin={"0px auto"}
                    >
                        {message || ""}
                    </StyledTypography>
                )}
            </Box>
            {isShowButton && <ActivateButton email={email} />}
        </Box>
    );
}
