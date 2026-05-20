"use client";

import { Box } from "@mui/material";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { StyledList } from "@/components/ui/StyledList";
import SidebarLink from "@/components/layout/navigation/SidebarLink";
import { NavGroup } from "@/components/layout/navigation/types";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

export default function Sidebar({
    config,
    label,
    minWidth = 250,
    hidePaths,
}: {
    config: NavGroup[];
    label?: MessageKeyType;
    minWidth?: number;
    hidePaths?: {
        strict?: string[];
        safe?: string[];
    };
}) {
    const pathname = usePathname();
    const t = useTranslations();
    if (
        hidePaths?.strict?.includes(pathname) ||
        hidePaths?.safe?.some((prefix) => pathname.startsWith(prefix))
    )
        return null;

    return (
        <Box
            display={"inline-flex"}
            minWidth={minWidth}
            flexDirection={"column"}
            sx={{ p: 1 }}
        >
            {label && (
                <StyledTypography
                    variant="h6"
                    sx={{ px: 1, mb: 2, mt: 1, fontWeight: 700 }}
                >
                    {t(label)}
                </StyledTypography>
            )}

            <Box display={"flex"} flexDirection={"column"} gap={2}>
                {config.map((group, gi) => (
                    <Box key={gi}>
                        {group.label && (
                            <StyledTypography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    px: 1,
                                    mb: 0.5,
                                    display: "block",
                                    fontWeight: 600,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {t(group.label)}
                            </StyledTypography>
                        )}

                        <StyledList dense disablePadding>
                            {group.items.map((item) => (
                                <SidebarLink key={item.label} item={item} />
                            ))}
                        </StyledList>

                        {gi < config.length - 1 && (
                            <StyledDivider sx={{ mt: 1.5 }} />
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
