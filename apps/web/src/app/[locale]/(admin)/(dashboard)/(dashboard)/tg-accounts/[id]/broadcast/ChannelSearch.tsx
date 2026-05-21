"use client";

import { useChannelSearch } from "@/hooks/tanstack/useBroadcast";
import { useAddBroadcastChannel } from "@/hooks/tanstack/useBroadcastMutations";
import { BroadcastChannelDto, ChannelSearchResultDto } from "@myorg/shared/dto";
import {
    Avatar,
    Box,
    CircularProgress,
    InputAdornment,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

interface Props {
    accountId: string;
    existingChannels: BroadcastChannelDto[];
}

export function ChannelSearch({ accountId, existingChannels }: Props) {
    const t = useTranslations();
    const [inputValue, setInputValue] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { mutate: addChannel, isPending: isAdding } = useAddBroadcastChannel(accountId);

    const enabled = debouncedQuery.trim().length > 0;
    const { data: results, isFetching } = useChannelSearch(accountId, debouncedQuery, enabled);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(inputValue);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [inputValue]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isAlreadyAdded = (telegramId: string) =>
        existingChannels.some((c) => c.telegramId === telegramId);

    const handleAdd = (channel: ChannelSearchResultDto) => {
        if (isAlreadyAdded(channel.telegramId)) return;
        addChannel({
            telegramId: channel.telegramId,
            username: channel.username,
            title: channel.title,
            photoBase64: channel.photoBase64,
            memberCount: channel.memberCount,
        });
        setInputValue("");
        setDebouncedQuery("");
        setOpen(false);
    };

    const showDropdown = open && (isFetching || (results && results.length > 0) || (enabled && !isFetching && results?.length === 0));

    return (
        <Box ref={containerRef} position="relative">
            <StyledTextField
                fullWidth
                size="small"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={t("pages.admin.tgAccounts.broadcast.channels.search.placeholder")}
                label={t("pages.admin.tgAccounts.broadcast.channels.search.label")}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                {isFetching ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <SearchIcon fontSize="small" color="action" />
                                )}
                            </InputAdornment>
                        ),
                    },
                }}
            />

            {showDropdown && (
                <Paper
                    elevation={4}
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        maxHeight: 320,
                        overflow: "auto",
                        mt: 0.5,
                        borderRadius: 2,
                    }}
                >
                    {isFetching && !results && (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress size={20} />
                        </Box>
                    )}

                    {!isFetching && enabled && results?.length === 0 && (
                        <Box py={2} px={2}>
                            <Typography variant="body2" color="text.secondary">
                                {t("pages.admin.tgAccounts.broadcast.channels.search.empty")}
                            </Typography>
                        </Box>
                    )}

                    {results && results.length > 0 && (
                        <List disablePadding>
                            {results.map((channel) => {
                                const added = isAlreadyAdded(channel.telegramId);
                                return (
                                    <ListItemButton
                                        key={channel.telegramId}
                                        onClick={() => handleAdd(channel)}
                                        disabled={added || isAdding}
                                        sx={{ gap: 1.5, py: 1 }}
                                    >
                                        <ListItemAvatar sx={{ minWidth: 0 }}>
                                            <Avatar
                                                src={channel.photoBase64 ? `data:image/jpeg;base64,${channel.photoBase64}` : undefined}
                                                sx={{ width: 36, height: 36, fontSize: 14 }}
                                            >
                                                {channel.title[0]}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={channel.title}
                                            secondary={
                                                channel.username
                                                    ? `@${channel.username}`
                                                    : channel.memberCount !== null
                                                    ? t("pages.admin.tgAccounts.broadcast.channels.members", {
                                                          count: channel.memberCount,
                                                      })
                                                    : undefined
                                            }
                                            slotProps={{
                                                primary: { noWrap: true, variant: "body2" },
                                                secondary: { noWrap: true, variant: "caption" },
                                            }}
                                        />
                                        <StyledIconButton
                                            size="small"
                                            color={added ? "success" : "primary"}
                                            disabled={added || isAdding}
                                            sx={{ flexShrink: 0, ml: "auto" }}
                                        >
                                            {added ? (
                                                <CheckIcon fontSize="small" />
                                            ) : (
                                                <AddIcon fontSize="small" />
                                            )}
                                        </StyledIconButton>
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </Paper>
            )}
        </Box>
    );
}
