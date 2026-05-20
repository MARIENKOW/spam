"use client";

// import LogoutErrorButton from "@/components/features/auth/LogoutErrorButton";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useRouter } from "@/i18n/navigation";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

type MessageProp = { message?: string; reset?: () => void };

export default function AuthErrorElement({ message, reset }: MessageProp) {
    const t = useTranslations();
    const router = useRouter();
    const resetFn = reset || router.refresh;
    const [isLoading, transition] = useTransition();
    return (
        <Box
            flex={1}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
            flexDirection={"column"}
            gap={5}
        >
            <Box display={"flex"} flexDirection={"column"} gap={1}>
                <StyledTypography textAlign={"center"} variant={"h3"}>
                    {t("feedback.error.auth.title")}
                </StyledTypography>
                <StyledTypography
                    maxWidth={700}
                    margin={"0px auto"}
                    textAlign={"center"}
                    variant={"h6"}
                >
                    {t("feedback.error.auth.subtitle")}
                </StyledTypography>
            </Box>
            {message && (
                <StyledTypography
                    textAlign={"center"}
                    variant={"body1"}
                    color="text.secondary"
                    maxWidth={700}
                    overflow={"hidden"}
                    margin={"0px auto"}
                >
                    {message || ""}
                </StyledTypography>
            )}
            <Box display={"flex"} gap={1} flexDirection={"column"}>
                <StyledButton
                    loading={isLoading}
                    onClick={() => transition(resetFn)}
                    variant="contained"
                >
                    {t("feedback.error.auth.reload")}
                </StyledButton>
                {/* <LogoutErrorButton /> */}
            </Box>
        </Box>
    );
}
