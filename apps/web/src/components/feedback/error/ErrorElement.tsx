"use client";

import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useRouter } from "@/i18n/navigation";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

type MessageProp = { message?: string; reset?: () => void };

export default function ErrorElement({ message, reset }: MessageProp) {
    const route = useRouter();
    const resetFn = reset || route.refresh;
    const t = useTranslations();
    const [loading, transition] = useTransition();
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
                    {t("feedback.error.fallback.title")}
                </StyledTypography>
                <StyledTypography
                    textAlign={"center"}
                    maxWidth={700}
                    margin={"0px auto"}
                    variant={"h6"}
                >
                    {t("feedback.error.fallback.subtitle")}
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
            {resetFn && (
                <StyledButton
                    loading={loading}
                    onClick={() => transition(resetFn)}
                    variant="contained"
                >
                    {t("feedback.error.fallback.reload")}
                </StyledButton>
            )}
        </Box>
    );
}
