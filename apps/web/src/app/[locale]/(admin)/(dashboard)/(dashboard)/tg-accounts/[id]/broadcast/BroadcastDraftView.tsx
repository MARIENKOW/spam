"use client";

import { ChannelSearch } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/ChannelSearch";
import { useConfirm } from "@/hooks/useConfirm";
import {
    useRemoveBroadcastChannel,
    useResetBroadcast,
    useStartBroadcast,
    useUpdateBroadcastMessage,
} from "@/hooks/tanstack/useBroadcastMutations";
import { BroadcastDto } from "@myorg/shared/dto";
import {
    Alert,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledTypography } from "@/components/ui/StyledTypography";

interface Props {
    accountId: string;
    broadcast: BroadcastDto;
}

export default function BroadcastDraftView({ accountId, broadcast }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();
    const [message, setMessage] = useState(broadcast.message);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    const { mutate: updateMessage } = useUpdateBroadcastMessage(accountId);
    const { mutate: removeChannel, isPending: isRemoving } = useRemoveBroadcastChannel(accountId);
    const { mutate: start, isPending: isStarting } = useStartBroadcast(accountId);
    const { mutate: reset, isPending: isResetting } = useResetBroadcast(accountId);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateMessage(message);
        }, 800);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [message]);

    const pendingCount = broadcast.progress.pending;
    const isDone = broadcast.status === "COMPLETED" ||
        (broadcast.status === "STOPPED" && pendingCount === 0);

    const handleStart = async () => {
        if (isDone) {
            reset();
            return;
        }
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.broadcast.actions.confirmStart"),
            description: t("pages.admin.tgAccounts.broadcast.actions.confirmStartBody", {
                count: pendingCount,
            }),
        });
        if (!ok) return;
        start();
    };

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {confirmDialog}

            <Box>
                <StyledTypography variant="h5" fontWeight={700} mb={3}>
                    {t("pages.admin.tgAccounts.broadcast.name")}
                </StyledTypography>

                <StyledTypography variant="subtitle2" color="text.secondary" mb={1}>
                    {t("pages.admin.tgAccounts.broadcast.message.label")}
                </StyledTypography>
                <StyledTextField
                    fullWidth
                    multiline
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("pages.admin.tgAccounts.broadcast.message.placeholder")}
                    variant="outlined"
                />
            </Box>

            <Divider />

            <Box>
                <StyledTypography variant="subtitle1" fontWeight={600} mb={2}>
                    {t("pages.admin.tgAccounts.broadcast.channels.title")}
                </StyledTypography>

                <ChannelSearch accountId={accountId} existingChannels={broadcast.channels} />

                {broadcast.channels.length > 0 && (
                    <List sx={{ mt: 1 }} disablePadding>
                        {broadcast.channels.map((channel, index) => (
                            <Box key={channel.id}>
                                {index > 0 && <Divider component="li" />}
                                <ListItem
                                    disablePadding
                                    sx={{ py: 1 }}
                                    secondaryAction={
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeChannel(channel.id)}
                                            disabled={isRemoving}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={channel.photoUrl ?? undefined}
                                            sx={{ width: 40, height: 40, fontSize: 16 }}
                                        >
                                            {channel.title[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={channel.title}
                                        secondary={
                                            <Box component="span" display="flex" flexDirection="column" gap={0.25}>
                                                {channel.username && (
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        @{channel.username}
                                                    </Typography>
                                                )}
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color={channel.recipientCount !== null ? "primary.main" : "text.disabled"}
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={0.5}
                                                >
                                                    {channel.recipientCount !== null ? (
                                                        <>
                                                            <PeopleIcon sx={{ fontSize: 12 }} />
                                                            {t("pages.admin.tgAccounts.broadcast.channels.recipients", {
                                                                count: channel.recipientCount,
                                                            })}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CircularProgress size={10} />
                                                            {t("pages.admin.tgAccounts.broadcast.channels.fetchingRecipients")}
                                                        </>
                                                    )}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                )}

                {broadcast.channels.length === 0 && (
                    <Typography variant="body2" color="text.disabled" mt={2}>
                        {t("pages.admin.tgAccounts.broadcast.channels.empty")}
                    </Typography>
                )}
            </Box>

            {pendingCount > 0 && (
                <Box>
                    <Chip
                        icon={<PeopleIcon />}
                        label={t("pages.admin.tgAccounts.broadcast.recipients.unique", {
                            count: pendingCount,
                        })}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            )}

            {isDone && (
                <Alert severity="info" sx={{ py: 0.5 }}>
                    {t("pages.admin.tgAccounts.broadcast.actions.newRunHint")}
                </Alert>
            )}

            <Box>
                <StyledButton
                    variant="contained"
                    color={isDone ? "warning" : "primary"}
                    startIcon={isDone ? <RefreshIcon /> : <PlayArrowIcon />}
                    onClick={handleStart}
                    loading={isStarting || isResetting}
                    disabled={
                        !isDone && (
                            !message.trim() ||
                            broadcast.channels.length === 0 ||
                            pendingCount === 0
                        )
                    }
                    size="large"
                >
                    {isDone
                        ? t("pages.admin.tgAccounts.broadcast.actions.newRun")
                        : t("pages.admin.tgAccounts.broadcast.actions.start")}
                </StyledButton>
            </Box>
        </Box>
    );
}
