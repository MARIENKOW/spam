"use client";

import { Box } from "@mui/material";
import DevicesIcon from "@mui/icons-material/Devices";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserManagementDto } from "@myorg/shared/dto";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledChip } from "@/components/ui/StyledChip";
import { ClientDate } from "@/components/common/ClientDate";
import { smartDate } from "@myorg/shared/utils";
import { UserNote } from "@/components/admin/userManagement/UserNote";
import { UserSessionsModal } from "@/components/admin/userManagement/UserSessionsModal";
import { StatusUserButton } from "@/components/admin/userManagement/actions/StatusUserButton";
import { DeleteUserButton } from "@/components/admin/userManagement/actions/DeleteUserButton";
import { StyledAvatar } from "@/components/ui/StyledAvatar";
import { StyledDivider } from "@/components/ui/StyledDivider";

const STATUS_COLOR = {
    ACTIVE: "success",
    NOACTIVE: "default",
    BLOCKED: "warning",
} as const;

export default function UserManagementItem({ user }: { user: UserManagementDto }) {
    const t = useTranslations();
    const [sessionsOpen, setSessionsOpen] = useState(false);

    const isBlocked = user.status === "BLOCKED";
    const isNoactive = user.status === "NOACTIVE";
    const initials = user.email.charAt(0).toUpperCase();

    const avatarColor = isBlocked ? "warning.main" : isNoactive ? "text.disabled" : "success.main";

    return (
        <>
            <UserSessionsModal user={user} open={sessionsOpen} onClose={() => setSessionsOpen(false)} />

            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: isBlocked ? "warning.main" : isNoactive ? "divider" : "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    "&:hover": { boxShadow: 2 },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        p: 2,
                        pb: 1.5,
                        opacity: isBlocked ? 0.65 : 1,
                        transition: "opacity 0.2s",
                    }}
                >
                    <StyledAvatar
                        src={user.avatar?.url}
                        sx={{
                            width: 44,
                            height: 44,
                            fontSize: 18,
                            fontWeight: 700,
                            flexShrink: 0,
                            bgcolor: avatarColor,
                            color: "primary.contrastText",
                        }}
                    >
                        {!user.avatar?.url && initials}
                    </StyledAvatar>

                    <Box flex={1} minWidth={0}>
                        <StyledTypography
                            variant="body2"
                            fontWeight={700}
                            sx={{ wordBreak: "break-all", lineHeight: 1.4 }}
                        >
                            {user.email}
                        </StyledTypography>
                        <Box display="flex" alignItems="center" gap={0.5} color="text.disabled">
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            {user.lastSeenAt ? (
                                <ClientDate
                                    date={user.lastSeenAt}
                                    variant="caption"
                                    color="text.disabled"
                                    format={(d, locale) => smartDate({ date: d, locale })}
                                />
                            ) : (
                                <StyledTypography variant="caption" color="text.disabled">—</StyledTypography>
                            )}
                        </Box>
                    </Box>

                    <StyledChip
                        label={t(`pages.admin.users.status.${user.status.toLowerCase() as "active" | "noactive" | "blocked"}`)}
                        size="small"
                        color={STATUS_COLOR[user.status]}
                        variant="outlined"
                        sx={{ flexShrink: 0, mt: 0.25 }}
                    />
                </Box>

                {/* Activity */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        pb: 1.5,
                        gap: 1,
                        opacity: isBlocked ? 0.55 : 1,
                        transition: "opacity 0.2s",
                    }}
                >
                    <Box display="flex" flexDirection="column" gap={0.25}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <LoginIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                            {user.lastLoginAt ? (
                                <ClientDate
                                    date={user.lastLoginAt}
                                    variant="caption"
                                    color="text.secondary"
                                    format={(d, locale) =>
                                        t("pages.admin.users.lastLogin", { time: smartDate({ date: d, locale }) })
                                    }
                                />
                            ) : (
                                <StyledTypography variant="caption" color="text.disabled">
                                    {t("pages.admin.users.lastLogin", { time: "—" })}
                                </StyledTypography>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <PersonAddAltIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                            <ClientDate
                                date={user.createdAt}
                                variant="caption"
                                color="text.disabled"
                                format={(d, locale) =>
                                    t("pages.admin.users.joined", { time: smartDate({ date: d, locale }) })
                                }
                            />
                        </Box>
                    </Box>

                    <Box
                        component="button"
                        onClick={() => setSessionsOpen(true)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            p: 0,
                            cursor: "pointer",
                            color: user.activeSessions > 0 ? "primary.main" : "text.disabled",
                            typography: "caption",
                            fontWeight: user.activeSessions > 0 ? 600 : 400,
                            "&:hover": { color: "primary.dark" },
                            transition: "color 0.15s",
                            flexShrink: 0,
                        }}
                    >
                        <DevicesIcon sx={{ fontSize: 13 }} />
                        {user.activeSessions}
                    </Box>
                </Box>

                <StyledDivider />

                {/* Note */}
                <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
                    <UserNote user={user} />
                </Box>

                <StyledDivider />

                {/* Actions */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                        px: 1.5,
                        py: 1,
                    }}
                >
                    <StatusUserButton user={user} />
                    <DeleteUserButton userId={user.id} />
                </Box>
            </Box>
        </>
    );
}
