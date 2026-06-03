"use client";

import { useState, useCallback } from "react";
import { Box } from "@mui/material";
import { MessengerAccountDialogsDto, MessengerDialogDto, MessengerMessageDto, MessengerNewMessageEvent } from "@myorg/shared/dto";
import { useMessengerSocket } from "@/hooks/useMessengerSocket";
import DialogList from "./DialogList";
import ChatWindow from "./ChatWindow";

type SelectedDialog = {
    accountId: string;
    accountName: string;
    dialog: MessengerDialogDto;
};

type Props = {
    initialAccounts: MessengerAccountDialogsDto[];
};

export default function MessengerPage({ initialAccounts }: Props) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [selected, setSelected] = useState<SelectedDialog | null>(null);
    const [liveMessages, setLiveMessages] = useState<Record<string, MessengerMessageDto[]>>({});

    const handleNewMessage = useCallback((event: MessengerNewMessageEvent) => {
        const key = `${event.accountId}:${event.dialogId}`;

        setLiveMessages((prev) => ({
            ...prev,
            [key]: [...(prev[key] ?? []), event.message],
        }));

        setAccounts((prev) =>
            prev.map((acc) => {
                if (acc.accountId !== event.accountId) return acc;
                return {
                    ...acc,
                    dialogs: acc.dialogs.map((d) => {
                        if (d.id !== event.dialogId) return d;
                        return {
                            ...d,
                            lastMessage: event.message.text,
                            lastMessageDate: event.message.date,
                            unreadCount: d.id === selected?.dialog.id && selected.accountId === event.accountId
                                ? d.unreadCount
                                : d.unreadCount + 1,
                        };
                    }),
                };
            }),
        );
    }, [selected]);

    useMessengerSocket(handleNewMessage);

    const handleSelectDialog = (accountId: string, accountName: string, dialog: MessengerDialogDto) => {
        setSelected({ accountId, accountName, dialog });
    };

    const selectedKey = selected ? `${selected.accountId}:${selected.dialog.id}` : null;
    const extraMessages = selectedKey ? (liveMessages[selectedKey] ?? []) : [];

    return (
        <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <Box
                sx={{
                    width: 320,
                    borderRight: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <DialogList
                    accounts={accounts}
                    selected={selected}
                    onSelect={handleSelectDialog}
                />
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {selected ? (
                    <ChatWindow
                        accountId={selected.accountId}
                        dialog={selected.dialog}
                        liveMessages={extraMessages}
                    />
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "text.secondary",
                        }}
                    >
                        Выберите диалог
                    </Box>
                )}
            </Box>
        </Box>
    );
}
