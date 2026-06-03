"use client";

import { Avatar, Badge, Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { MessengerAccountDialogsDto, MessengerDialogDto } from "@myorg/shared/dto";

type SelectedDialog = {
    accountId: string;
    dialog: MessengerDialogDto;
} | null;

type Props = {
    accounts: MessengerAccountDialogsDto[];
    selected: SelectedDialog;
    onSelect: (accountId: string, accountName: string, dialog: MessengerDialogDto) => void;
};

export default function DialogList({ accounts, selected, onSelect }: Props) {
    if (accounts.length === 0) {
        return (
            <Box sx={{ p: 2, color: "text.secondary", fontSize: 14 }}>
                Нет привязанных аккаунтов
            </Box>
        );
    }

    return (
        <Box sx={{ overflowY: "auto", flex: 1 }}>
            {accounts.map((acc) => (
                <Box key={acc.accountId}>
                    <Box sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {acc.accountName}
                        </Typography>
                    </Box>
                    <List disablePadding>
                        {acc.dialogs.map((dialog) => {
                            const isSelected =
                                selected?.accountId === acc.accountId && selected?.dialog.id === dialog.id;

                            return (
                                <ListItemButton
                                    key={dialog.id}
                                    selected={isSelected}
                                    onClick={() => onSelect(acc.accountId, acc.accountName, dialog)}
                                    sx={{ px: 2, py: 1, alignItems: "flex-start" }}
                                >
                                    <Avatar sx={{ width: 36, height: 36, mr: 1.5, mt: 0.25, fontSize: 14 }}>
                                        {dialog.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                                                    {dialog.name || "Без названия"}
                                                </Typography>
                                                {dialog.lastMessageDate && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                                                        {formatDate(dialog.lastMessageDate)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ maxWidth: 180 }}
                                                >
                                                    {dialog.lastMessage ?? ""}
                                                </Typography>
                                                {dialog.unreadCount > 0 && (
                                                    <Badge
                                                        badgeContent={dialog.unreadCount}
                                                        color="primary"
                                                        sx={{ ml: 1, "& .MuiBadge-badge": { position: "static", transform: "none" } }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                    <Divider />
                </Box>
            ))}
        </Box>
    );
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}
