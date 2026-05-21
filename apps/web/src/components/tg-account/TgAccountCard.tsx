"use client";

import { TgAccountDto } from "@myorg/shared/dto";
import { useDeleteTgAccount } from "@/hooks/tanstack/useTgAccountMutations";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    MenuProps,
    Tooltip,
    Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import StarIcon from "@mui/icons-material/Star";
import StarPurple500Icon from "@mui/icons-material/StarPurple500";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ClientDate } from "@/components/common/ClientDate";
import { relativeTime } from "@myorg/shared/utils";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledMenu } from "@/components/ui/StyledMenu";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { useConfirm } from "@/hooks/useConfirm";
import { Link } from "@/i18n/navigation";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

const TG_AVATAR_COLORS = [
    "#E17076",
    "#7BC862",
    "#E5CA77",
    "#65AADD",
    "#A695E7",
    "#EE7AAE",
    "#55BBA4",
];

function getAvatarColor(telegramId: string): string {
    const num = parseInt(telegramId.slice(-3), 10) || 0;
    return TG_AVATAR_COLORS[num % TG_AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string | null): string {
    const first = firstName[0]?.toUpperCase() ?? "";
    const last = lastName?.[0]?.toUpperCase() ?? "";
    return first + last;
}

interface Props {
    account: TgAccountDto;
    showOwner?: boolean;
}

export default function TgAccountCard({ account, showOwner }: Props) {
    const t = useTranslations();
    const [anchorEl, setAnchorEl] = useState<MenuProps["anchorEl"] | null>(null);
    const { confirm, confirmDialog } = useConfirm();
    const { mutate: deleteFn, isPending } = useDeleteTgAccount();

    const avatarColor = getAvatarColor(account.telegramId);
    const initials = getInitials(account.firstName, account.lastName);
    const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ");

    const broadcastHref = `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${account.id}/broadcast`;

    const handleDelete = async () => {
        setAnchorEl(null);
        const ok = await confirm();
        if (!ok) return;
        deleteFn(account.id);
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 4 },
                height: "100%",
            }}
        >
            {confirmDialog}
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box display="flex" gap={2} alignItems="flex-start">
                    <Avatar
                        src={account.photoUrl ?? undefined}
                        alt={fullName}
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: avatarColor,
                            fontSize: 20,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {!account.photoUrl && initials}
                    </Avatar>

                    <Box flex={1} minWidth={0}>
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.25}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                noWrap
                                sx={{ lineHeight: 1.3 }}
                            >
                                {fullName}
                            </Typography>
                            {account.isPremium && (
                                <Tooltip title={t("pages.admin.tgAccounts.premium")}>
                                    <StarIcon sx={{ fontSize: 16, color: "#FFB800" }} />
                                </Tooltip>
                            )}
                        </Box>

                        {account.username && (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.25 }}>
                                @{account.username}
                            </Typography>
                        )}

                        <Typography variant="body2" color="text.secondary" noWrap>
                            {account.phone}
                        </Typography>
                    </Box>

                    <StyledIconButton
                        size="small"
                        aria-haspopup="true"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ flexShrink: 0 }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </StyledIconButton>
                </Box>

                <StyledMenu
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    anchorEl={anchorEl}
                >
                    <Link href={broadcastHref} style={{ textDecoration: "none", color: "inherit" }}>
                        <StyledMenuItem onClick={() => setAnchorEl(null)}>
                            <StyledListItemIcon>
                                <CampaignIcon color="primary" />
                            </StyledListItemIcon>
                            <StyledTypography>
                                {t("pages.admin.tgAccounts.broadcast.name")}
                            </StyledTypography>
                        </StyledMenuItem>
                    </Link>
                    <StyledMenuItem onClick={handleDelete} disabled={isPending}>
                        <StyledListItemIcon>
                            <DeleteForeverIcon color="error" />
                        </StyledListItemIcon>
                        <StyledTypography color="error" textTransform="capitalize">
                            {t("common.delete")}
                        </StyledTypography>
                    </StyledMenuItem>
                </StyledMenu>

                {showOwner && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        mt={1.5}
                        px={1}
                        py={0.5}
                        borderRadius={1}
                        bgcolor="action.hover"
                    >
                        <StyledTypography variant="caption" color="text.secondary">
                            {t("pages.admin.tgAccounts.owner")}:
                        </StyledTypography>
                        {account.adminRole === "SUPERADMIN" ? (
                            <Box display="inline-flex" gap={0.5} alignItems="center">
                                <StyledTypography fontSize={11} color="primary" variant="body2">
                                    SUPERADMIN
                                </StyledTypography>
                                <StarPurple500Icon color="primary" sx={{ fontSize: 14 }} />
                            </Box>
                        ) : (
                            <StyledTypography variant="caption" color="text.primary" noWrap>
                                {account.adminEmail}
                            </StyledTypography>
                        )}
                    </Box>
                )}

                <Box mt={1.5} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <ClientDate
                        date={account.createdAt}
                        format={(date, locale) => t("pages.admin.tgAccounts.added", { time: relativeTime({ date, locale }) })}
                        variant="caption"
                        color="text.disabled"
                    />
                    {account.broadcastStatus === "RUNNING" && account.broadcastProgress ? (
                        <Link href={broadcastHref} style={{ textDecoration: "none" }}>
                            <Chip
                                size="small"
                                icon={<CampaignIcon sx={{ fontSize: "14px !important" }} />}
                                label={t("pages.admin.tgAccounts.broadcast.progress", {
                                    sent: account.broadcastProgress.sent,
                                    total: account.broadcastProgress.total,
                                })}
                                color="warning"
                                variant="outlined"
                                clickable
                                sx={{ fontSize: 11 }}
                            />
                        </Link>
                    ) : account.broadcastRunCount > 0 ? (
                        <Link href={broadcastHref} style={{ textDecoration: "none" }}>
                            <Chip
                                size="small"
                                icon={<CampaignIcon sx={{ fontSize: "14px !important" }} />}
                                label={t("pages.admin.tgAccounts.broadcast.runs", { count: account.broadcastRunCount })}
                                color="default"
                                variant="outlined"
                                clickable
                                sx={{ fontSize: 11 }}
                            />
                        </Link>
                    ) : null}
                </Box>
            </CardContent>
        </Card>
    );
}
