"use client";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default function NotFoundElement({ message }: { message?: string }) {
    const t = useTranslations();
    return (
        <Box
            flex={1}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
        >
            {t("pages.notFound.name")}
        </Box>
    );
}
