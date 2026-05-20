"use client";

import { StyledTypography } from "@/components/ui/StyledTypography";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";

type MessageProp = { message?: string; reset?: () => void };

export default function ForbiddenErrorElement({ message }: MessageProp) {
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
                    {t("feedback.error.forbidden.title")}
                </StyledTypography>
                <StyledTypography
                    textAlign={"center"}
                    maxWidth={700}
                    margin={"0px auto"}
                    variant={"h6"}
                >
                    {t("feedback.error.forbidden.subtitle")}
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
        </Box>
    );
}
