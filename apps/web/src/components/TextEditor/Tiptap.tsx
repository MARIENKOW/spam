"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useEditor, TiptapWrapper, TiptapContent } from "@tiptap/react";
import type { Extensions } from "@tiptap/core";
import { Box } from "@mui/material";
import { StyledDivider } from "@/components/ui/StyledDivider";
import CharacterCountBar from "./components/CharacterCountBar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TiptapProps {
    value?: string;
    onChange?: (html: string) => void;
    onVideosChange?: (videos: string[]) => void;
    onImagesChange?: (images: string[]) => void;
    error?: boolean;
    extensions: Extensions;
    children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Tiptap({
    value,
    onChange,
    onVideosChange,
    onImagesChange,
    error,
    extensions,
    children,
}: TiptapProps) {
    const isControlled = value !== undefined;
    const lastEmittedHtml = useRef<string>(value ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onVideosChangeRef = useRef(onVideosChange);
    onVideosChangeRef.current = onVideosChange;
    const onImagesChangeRef = useRef(onImagesChange);
    onImagesChangeRef.current = onImagesChange;

    const editor = useEditor({
        extensions,
        immediatelyRender: false,
        ...(isControlled && { content: value }),
        onBlur: ({ editor }) => {
            if (!isControlled) return;
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            const html = editor.isEmpty ? "" : editor.getHTML();
            lastEmittedHtml.current = html;
            onChangeRef.current?.(html);
        },
        onUpdate: ({ editor }) => {
            if (isControlled) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    const html = editor.isEmpty ? "" : editor.getHTML();
                    lastEmittedHtml.current = html;
                    onChangeRef.current?.(html);
                }, 300);
            }
            if (onVideosChangeRef.current) {
                const ids = new Set<string>();
                editor.state.doc.descendants((node) => {
                    if (node.type.name === "video" && node.attrs["data-id"])
                        ids.add(node.attrs["data-id"]);
                });
                onVideosChangeRef.current(Array.from(ids));
            }
            if (onImagesChangeRef.current) {
                const ids = new Set<string>();
                editor.state.doc.descendants((node) => {
                    if (node.type.name === "image" && node.attrs["data-id"])
                        ids.add(node.attrs["data-id"]);
                });
                onImagesChangeRef.current(Array.from(ids));
            }
        },
    });

    useEffect(() => {
        if (!isControlled || !editor) return;
        if (lastEmittedHtml.current === value) return;
        lastEmittedHtml.current = value ?? "";
        editor.commands.setContent(value ?? "");
    }, [value, editor, isControlled]);

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: error ? "error.main" : "divider",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                flex: 1,
            }}
        >
            {editor ? (
                <TiptapWrapper editor={editor}>
                    {/* ── Toolbar ─────────────────────────────────────── */}
                    <Box
                        py="2px"
                        display="flex"
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        {children}
                    </Box>
                    <StyledDivider />

                    {/* ── Editor content ──────────────────────────────── */}
                    <Box
                        display="flex"
                        flexDirection="column"
                        flex={1}
                        sx={{
                            "& > div": {
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                            },
                            "& .tiptap": {
                                minWidth: "100%",
                                width: "100%",
                                outline: "none",
                                padding: "0 10px 10px 10px",
                                flex: 1,
                            },
                        }}
                    >
                        <TiptapContent />
                    </Box>

                    {/* ── Character count ─────────────────────────────── */}
                    <CharacterCountBar />
                </TiptapWrapper>
            ) : (
                <>
                    <Box
                        py="3px"
                        display="flex"
                        alignItems="center"
                        flexWrap="wrap"
                        minHeight={42}
                    />
                    <StyledDivider />
                    <Box
                        display="flex"
                        flexDirection="column"
                        flex={1}
                        sx={{
                            "& .tiptap": {
                                minWidth: "100%",
                                width: "100%",
                                outline: "none",
                                padding: "0 10px 10px 10px",
                                flex: 1,
                            },
                        }}
                    >
                        <div
                            className="tiptap"
                            dangerouslySetInnerHTML={{ __html: value ?? "" }}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}
