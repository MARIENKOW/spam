"use client";

import { InviteChannelSearch } from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/InviteChannelSearch";
import { useConfirm } from "@/hooks/useConfirm";
import {
    useFetchInviteChannelRecipients,
    useRemoveInviteChannel,
    useSetInviteTargetChannel,
    useStartInvite,
} from "@/hooks/tanstack/useInviteMutations";
import { useOwnedChannels } from "@/hooks/tanstack/useTgAccountDetail";
import { InviteDto } from "@myorg/shared/dto";
import {
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
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PeopleIcon from "@mui/icons-material/People";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledTextField } from "@/components/ui/StyledTextField";
import AccountBreadcrumbs from "@/components/features/Breadcrumbs/AccountBreadcrumbs";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

interface Props {
    accountId: string;
    invite: InviteDto;
}

export default function InviteDraftView({ accountId, invite }: Props) {
    const t = useTranslations();
    const { confirm, confirmDialog } = useConfirm();

    const { data: ownedChannels = [] } = useOwnedChannels(accountId);
    const { mutate: setTargetChannel } = useSetInviteTargetChannel(accountId);
    const { mutate: removeChannel, isPending: isRemoving } =
        useRemoveInviteChannel(accountId);
    const {
        mutate: fetchRecipients,
        isPending: isFetching,
        variables: fetchingChannelId,
    } = useFetchInviteChannelRecipients(accountId);
    const { mutate: start, isPending: isStarting } = useStartInvite(accountId);

    const pendingCount = invite.progress.pending;

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const telegramId = e.target.value;
        const ch = ownedChannels.find((c) => c.telegramId === telegramId);
        if (!ch) return;
        setTargetChannel({
            telegramId: ch.telegramId,
            accessHash: ch.accessHash,
            title: ch.title,
            username: ch.username,
            photoBase64: ch.photoBase64,
        });
    };

    const handleStart = async () => {
        if (!invite.targetChannelTelegramId) return;
        const ok = await confirm({
            title: t("pages.admin.tgAccounts.invite.actions.confirmStart"),
            description: t(
                "pages.admin.tgAccounts.invite.actions.confirmStartBody",
                {
                    channel: invite.targetChannelTitle ?? "",
                },
            ),
        });
        if (!ok) return;
        start();
    };

    const canStart =
        !!invite.targetChannelTelegramId &&
        invite.channels.length > 0 &&
        pendingCount > 0;

    return (
        <Box display="flex" flexDirection="column" gap={3}>
            {confirmDialog}
            <AccountBreadcrumbs accountId={accountId} extra={[{ name: t("pages.admin.tgAccounts.invite.name"), href: `${FULL_PATH_ROUTE.admin.tgAccounts.path}/${accountId}/invite` }]} />

            <Box>
                <StyledTypography variant="h5" fontWeight={700} mb={3}>
                    {t("pages.admin.tgAccounts.invite.name")}
                </StyledTypography>

                <StyledTextField
                    select
                    fullWidth
                    size="small"
                    value={invite.targetChannelTelegramId ?? ""}
                    onChange={handleTargetChange}
                    label={t(
                        "pages.admin.tgAccounts.invite.targetChannel.label",
                    )}
                >
                    {ownedChannels.length === 0 && (
                        <MenuItem value="" disabled>
                            {t(
                                "pages.admin.tgAccounts.invite.targetChannel.notSelected",
                            )}
                        </MenuItem>
                    )}
                    {ownedChannels.map((ch) => (
                        <MenuItem key={ch.telegramId} value={ch.telegramId}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                    src={
                                        ch.photoBase64
                                            ? `data:image/jpeg;base64,${ch.photoBase64}`
                                            : undefined
                                    }
                                    sx={{ width: 24, height: 24, fontSize: 11 }}
                                >
                                    {ch.title[0]}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        component="span"
                                    >
                                        {ch.title}
                                    </Typography>
                                    {ch.username && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            component="span"
                                            ml={0.75}
                                        >
                                            @{ch.username}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </MenuItem>
                    ))}
                </StyledTextField>
            </Box>

            <Divider />

            <Box>
                <StyledTypography variant="subtitle1" fontWeight={600} mb={2}>
                    {t("pages.admin.tgAccounts.invite.channels.title")}
                </StyledTypography>

                <InviteChannelSearch
                    accountId={accountId}
                    existingChannels={invite.channels}
                />

                {invite.channels.length > 0 && (
                    <List sx={{ mt: 1 }} disablePadding>
                        {invite.channels.map((channel, index) => (
                            <Box key={channel.id}>
                                {index > 0 && <Divider component="li" />}
                                <ListItem
                                    disablePadding
                                    sx={{ py: 1 }}
                                    secondaryAction={
                                        <Box display="flex" gap={0.5}>
                                            <Tooltip
                                                title={t(
                                                    "pages.admin.tgAccounts.invite.channels.fetchRecipientsBtn",
                                                )}
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() =>
                                                            fetchRecipients(
                                                                channel.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isFetching &&
                                                            fetchingChannelId ===
                                                                channel.id
                                                        }
                                                    >
                                                        {isFetching &&
                                                        fetchingChannelId ===
                                                            channel.id ? (
                                                            <CircularProgress
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <PersonSearchIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    removeChannel(channel.id)
                                                }
                                                disabled={isRemoving}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={channel.photoUrl ?? undefined}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                fontSize: 16,
                                            }}
                                        >
                                            {channel.title[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={channel.title}
                                        secondary={
                                            <Box
                                                component="span"
                                                display="flex"
                                                flexDirection="column"
                                                gap={0.25}
                                            >
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
                                                    color={
                                                        channel.recipientCount !==
                                                        null
                                                            ? "primary.main"
                                                            : "text.disabled"
                                                    }
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={0.5}
                                                >
                                                    {channel.fetchError ? (
                                                        <>
                                                            <ErrorOutlineIcon
                                                                sx={{
                                                                    fontSize: 12,
                                                                }}
                                                            />
                                                            {channel.fetchError}
                                                        </>
                                                    ) : channel.recipientCount !==
                                                      null ? (
                                                        <>
                                                            <PeopleIcon
                                                                sx={{
                                                                    fontSize: 12,
                                                                    color:
                                                                        channel.recipientCount ===
                                                                        0
                                                                            ? "warning.main"
                                                                            : undefined,
                                                                }}
                                                            />
                                                            {t(
                                                                "pages.admin.tgAccounts.invite.channels.recipients",
                                                                {
                                                                    count: channel.recipientCount,
                                                                },
                                                            )}
                                                            {channel.giftCount !==
                                                                null && (
                                                                <Typography
                                                                    component="span"
                                                                    variant="caption"
                                                                    color="text.disabled"
                                                                    ml={0.5}
                                                                >
                                                                    (
                                                                    {t(
                                                                        "pages.admin.tgAccounts.invite.channels.gifts",
                                                                        {
                                                                            count: channel.giftCount,
                                                                        },
                                                                    )}
                                                                    )
                                                                </Typography>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CircularProgress
                                                                size={10}
                                                            />
                                                            {t(
                                                                "pages.admin.tgAccounts.invite.channels.fetchingRecipients",
                                                            )}
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

                {invite.channels.length === 0 && (
                    <Typography variant="body2" color="text.disabled" mt={2}>
                        {t("pages.admin.tgAccounts.invite.channels.empty")}
                    </Typography>
                )}
            </Box>

            {pendingCount > 0 && (
                <Box>
                    <Chip
                        icon={<PeopleIcon />}
                        label={t(
                            "pages.admin.tgAccounts.invite.recipients.unique",
                            { count: pendingCount },
                        )}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            )}

            <Box>
                <StyledButton
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    fullWidth
                    onClick={handleStart}
                    loading={isStarting}
                    disabled={!canStart}
                    size="large"
                >
                    {t("pages.admin.tgAccounts.invite.actions.start")}
                </StyledButton>
            </Box>
        </Box>
    );
}
