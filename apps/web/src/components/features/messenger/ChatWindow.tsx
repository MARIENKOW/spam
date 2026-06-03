"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Box, CircularProgress, IconButton, InputBase, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { MessengerDialogDto, MessengerMessageDto } from "@myorg/shared/dto";
import { $apiAdminClient } from "@/utils/api/admin/fetch.admin.client";
import MessengerService from "@/services/messenger/messenger.service";

const messengerService = new MessengerService($apiAdminClient);

type Props = {
    accountId: string;
    dialog: MessengerDialogDto;
    liveMessages: MessengerMessageDto[];
};

export default function ChatWindow({ accountId, dialog, liveMessages }: Props) {
    const [messages, setMessages] = useState<MessengerMessageDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([]);
        setLoading(true);
        messengerService
            .getMessages({ accountId, dialogId: dialog.id })
            .then((res) => setMessages(res.data.reverse()))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [accountId, dialog.id]);

    useEffect(() => {
        if (liveMessages.length === 0) return;
        setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = liveMessages.filter((m) => !existingIds.has(m.id));
            return newOnes.length ? [...prev, ...newOnes] : prev;
        });
    }, [liveMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        try {
            await messengerService.sendMessage({ accountId, dialogId: dialog.id, text: trimmed });
            setText("");
            const optimistic: MessengerMessageDto = {
                id: Date.now(),
                text: trimmed,
                date: new Date().toISOString(),
                fromMe: true,
                fromName: null,
            };
            setMessages((prev) => [...prev, optimistic]);
        } catch {
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Typography variant="subtitle2" fontWeight={700}>
                    {dialog.name || "Диалог"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {dialog.type === "user" ? "Личные сообщения" : dialog.type === "group" ? "Группа" : "Канал"}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                )}
                <div ref={bottomRef} />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <InputBase
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написать сообщение..."
                    multiline
                    maxRows={4}
                    sx={{ flex: 1, fontSize: 14 }}
                />
                <IconButton onClick={send} disabled={!text.trim() || sending} size="small" color="primary">
                    <SendIcon fontSize="small" />
                </IconButton>
            </Paper>
        </Box>
    );
}

function MessageBubble({ msg }: { msg: MessengerMessageDto }) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: msg.fromMe ? "flex-end" : "flex-start",
            }}
        >
            <Box
                sx={{
                    maxWidth: "70%",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: msg.fromMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    bgcolor: msg.fromMe ? "primary.main" : "action.hover",
                    color: msg.fromMe ? "primary.contrastText" : "text.primary",
                }}
            >
                {msg.fromName && !msg.fromMe && (
                    <Typography variant="caption" fontWeight={600} display="block">
                        {msg.fromName}
                    </Typography>
                )}
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.text}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "right", mt: 0.25, opacity: 0.7, fontSize: "0.65rem" }}
                >
                    {new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Typography>
            </Box>
        </Box>
    );
}
