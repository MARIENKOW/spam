"use client";
import { Box, useTheme } from "@mui/material";
import { AccessTime, Shield } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { Window, Apple, Android, HelpOutline } from "@mui/icons-material";
import { LaptopMac, PhoneIphone, TabletMac } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";
import { SessionUserViewDto, SessionViewDto } from "@myorg/shared/dto";
import { StyledChip } from "@/components/ui/StyledChip";
import { ClientDate } from "@/components/common/ClientDate";
import { ReactNode } from "react";

interface DeviceIconProps extends SvgIconProps {
    type: SessionUserViewDto["device"]["type"];
}

export const DeviceIcon = ({ type, sx, ...rest }: DeviceIconProps) => {
    const Icon =
        type === "mobile"
            ? PhoneIphone
            : type === "tablet"
              ? TabletMac
              : LaptopMac;

    return <Icon sx={sx} {...rest} />;
};

interface OsIconProps {
    icon: SessionUserViewDto["device"]["icon"];
    size?: number;
}

export const OsIcon = ({ icon, size = 20 }: OsIconProps) => {
    const props = { sx: { fontSize: size } };
    switch (icon) {
        case "windows":
            return <Window {...props} />;
        case "macos":
            return <Apple {...props} />;
        case "ios":
            return <Apple {...props} />;
        case "android":
            return <Android {...props} />;
        default:
            return <HelpOutline {...props} />;
    }
};

interface SessionCardProps<T extends SessionViewDto> {
    session: T;
    action?: ReactNode;
}

export const SessionCard = <T extends SessionViewDto>({
    session,
    action,
}: SessionCardProps<T>) => {
    const theme = useTheme();
    const v = theme.vars!;
    const t = useTranslations("components.sessionList");
    const { device, location, isCurrent, lastUsedAt } = session;
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isCurrent
                    ? `rgba(${v.palette.primary.mainChannel} / 0.4)`
                    : "divider",
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    width: { xs: 68, sm: 48 },
                    height: { xs: 68, sm: 48 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: isCurrent
                        ? `rgba(${v.palette.primary.mainChannel} / 0.1)`
                        : `rgba(${v.palette.text.primaryChannel} / 0.05)`,
                    color: isCurrent ? "primary.main" : "text.secondary",
                }}
            >
                <DeviceIcon
                    type={device.type}
                    sx={{ fontSize: { xs: 48, sm: 24 } }}
                />
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                gap={1}
                sx={{ flex: 1, minWidth: 0 }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, sm: 2 },
                        flexDirection: { xs: "column", sm: "row" },
                        flexWrap: "wrap",
                    }}
                >
                    {isCurrent && (
                        <StyledChip
                            icon={
                                <Shield sx={{ fontSize: "12px !important" }} />
                            }
                            label={t("thisDevice")}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                                display: { xs: "flex", sm: "none" },
                                height: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                "& .MuiChip-label": { px: 0.75, lineHeight: 2 },
                                "& .MuiChip-icon": { ml: 0.5, mr: 0 },
                            }}
                        />
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <StyledTypography
                            variant="body2"
                            fontWeight={600}
                            sx={{ lineHeight: 1.3 }}
                            noWrap
                        >
                            {device.browser}
                        </StyledTypography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: "text.secondary",
                            }}
                        >
                            <OsIcon icon={device.icon} size={14} />
                            <StyledTypography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                            >
                                {device.os}
                            </StyledTypography>
                        </Box>
                    </Box>
                    {isCurrent && (
                        <StyledChip
                            icon={
                                <Shield sx={{ fontSize: "12px !important" }} />
                            }
                            label={t("thisDevice")}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                                display: { xs: "none", sm: "flex" },
                                height: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                "& .MuiChip-label": { px: 0.75, lineHeight: 1 },
                                "& .MuiChip-icon": { ml: 0.5, mr: 0 },
                            }}
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <StyledTypography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                        {[location.city, location.country]
                            .filter(Boolean)
                            .join(", ") || location.ip}
                    </StyledTypography>
                    <Box
                        component="span"
                        sx={{
                            width: 3,
                            height: 3,
                            borderRadius: "50%",
                            bgcolor: "text.disabled",
                            flexShrink: 0,
                        }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "text.secondary",
                        }}
                    >
                        <AccessTime sx={{ fontSize: 12 }} />
                        <ClientDate
                            date={lastUsedAt}
                            component="span"
                            variant="caption"
                            sx={{ cursor: "default" }}
                            tooltipProps={{ placement: "top", arrow: true }}
                        />
                    </Box>
                </Box>
            </Box>

            {!isCurrent && action}
        </Box>
    );
};
