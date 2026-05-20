"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { isApiErrorResponse } from "@/helpers/error/error.type.helper";
import { Link } from "@/i18n/navigation";
import { Box } from "@mui/material";
import { ApiErrorResponse, ErrorsWithMessages } from "@myorg/shared/dto";
import { MessageKeyType } from "@myorg/shared/i18n";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";

export default function ResetTokenErrorElement({ error }: { error: unknown }) {
    const t = useTranslations();
    let message;
    if (isApiErrorResponse(error)) {
        const { data }: { data: ErrorsWithMessages } =
            error as ApiErrorResponse;
        message = data.root?.[0].message;
    }
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
                    {t("feedback.error.resetToken.title")}
                </StyledTypography>
                <StyledTypography
                    textAlign={"center"}
                    maxWidth={700}
                    margin={"0px auto"}
                    variant={"h6"}
                >
                    {t("feedback.error.resetToken.subtitle")}
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
            <Link href={FULL_PATH_ROUTE.admin.forgotPasssword.path}>
                <StyledButton variant="contained">
                    {t("pages.admin.forgotPassword.name")}
                </StyledButton>
            </Link>
        </Box>
    );
}
