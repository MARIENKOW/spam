"use client";

import { useState, useRef, useCallback } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import * as uuid from "uuid";

import { MessageKeyType } from "@myorg/shared/i18n";
import { BLOG_IMAGE_CONFIG, BlogImageSchema } from "@myorg/shared/form";
import { DropZone } from "@/components/features/form/fields/uncontrolled/DropZone";
import { UploadTrigger } from "@/components/features/Uploader/UploadTrigger";
import { UploadQueue } from "@/components/features/Uploader/UploadQueue";
import { UploadItem, UploadStatus } from "@/components/features/Uploader/types";
import { StyledDrawer } from "@/components/ui/StyledDrawer";
import { StyledTypography } from "@/components/ui/StyledTypography";
import BlogImageService from "@/services/blog/image/blogImage.service";
import { $apiUserAxiosClient } from "@/utils/api/user/axios.user.client";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { imageKeys } from "@/lib/tanstack/keys";
import { snackbarSuccess } from "@/utils/snackbar/snackbar.success";
import { snackbarError } from "@/utils/snackbar/snackbar.error";
import { $apiAdminAxiosClient } from "@/utils/api/admin/axios.admin.client";

const { upload } = new BlogImageService($apiAdminAxiosClient);

const DRAWER_WIDTH = 340;

const isFinished = (s: UploadItem["status"]) =>
    s === "done" || s === "error" || s === "cancelled";

export function BlogImageUploader() {
    const t = useTranslations();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const abortRefs = useRef<Record<string, AbortController>>({});
    const smoothedSpeed = useRef<Record<string, number>>({});

    const patch = useCallback((id: string, data: Partial<UploadItem>) => {
        setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
        );
    }, []);

    const uploadOne = useCallback(
        async (item: UploadItem) => {
            patch(item.id, { status: "uploading" });
            let lastLoaded = 0;
            let lastTime = Date.now();

            try {
                await upload(
                    { image: item.file },
                    {
                        signal: abortRefs.current[item.id]?.signal,
                        headers: { "Content-Type": "multipart/form-data" },
                        onUploadProgress: (e) => {
                            const loaded = e.loaded;
                            const total = e.total ?? 0;
                            const now = Date.now();
                            const dt = (now - lastTime) / 1000;
                            if (dt > 0.1) {
                                const instant = (loaded - lastLoaded) / dt;
                                const prev =
                                    smoothedSpeed.current[item.id] ?? instant;
                                smoothedSpeed.current[item.id] =
                                    0.3 * instant + 0.7 * prev;
                                lastLoaded = loaded;
                                lastTime = now;
                            }
                            patch(item.id, {
                                progress:
                                    total > 0
                                        ? Math.min(
                                              Math.round(
                                                  (loaded / total) * 100,
                                              ),
                                              100,
                                          )
                                        : 0,
                                speed: smoothedSpeed.current[item.id] ?? 0,
                            });
                        },
                    },
                );
                patch(item.id, { status: "done", progress: 100, speed: 0 });
                delete smoothedSpeed.current[item.id];
                snackbarSuccess(
                    t("image.uploader.uploadSuccess", { name: item.file.name }),
                );
                queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
            } catch (err) {
                let status: UploadStatus = "error";
                errorHandler({
                    error: err,
                    t,
                    fallback: {
                        cancel: {
                            hideMessage: true,
                            callback: () => {
                                status = "cancelled";
                            },
                        },
                    },
                });
                patch(item.id, { status, speed: 0 });
            } finally {
                delete abortRefs.current[item.id];
            }
        },
        [patch, queryClient, t],
    );

    const handleFiles = useCallback(
        (files: File[]) => {
            const fileSchema = BlogImageSchema.shape.images.element;
            const validItems: UploadItem[] = [];
            const errorItems: UploadItem[] = [];
            const seen = new Set<string>();

            files.forEach((file) => {
                const result = fileSchema.safeParse(file);
                if (result.success) {
                    validItems.push({
                        id: uuid.v4(),
                        file,
                        status: "waiting",
                        progress: 0,
                        speed: 0,
                    });
                } else {
                    errorItems.push({
                        id: uuid.v4(),
                        file,
                        status: "error",
                        progress: 0,
                        speed: 0,
                    });
                    const msg = result.error.issues[0]?.message;
                    if (msg && !seen.has(msg)) {
                        seen.add(msg);
                        snackbarError(t(msg as MessageKeyType));
                    }
                }
            });

            const allItems = [...validItems, ...errorItems];
            if (allItems.length === 0) return;

            validItems.forEach((item) => {
                abortRefs.current[item.id] = new AbortController();
            });
            setUploads((prev) => [...allItems, ...prev]);
            void Promise.allSettled(validItems.map(uploadOne));
        },
        [uploadOne, t],
    );

    const total = uploads.length;
    const done = uploads.filter((u) => u.status === "done").length;
    const errors = uploads.filter((u) => u.status === "error").length;
    const active = uploads.filter((u) => u.status === "uploading");
    const waiting = uploads.filter((u) => u.status === "waiting").length;
    const cancellableCount = uploads.filter(
        (u) => u.status === "waiting" || u.status === "uploading",
    ).length;
    const hasFinished = uploads.some((u) => isFinished(u.status));
    const avgProgress = active.length
        ? Math.round(active.reduce((s, u) => s + u.progress, 0) / active.length)
        : 0;

    return (
        <>
            <UploadTrigger
                onClick={() => setOpen(true)}
                total={total}
                done={done}
                errors={errors}
                activeCount={active.length}
                waiting={waiting}
                avgProgress={avgProgress}
                triggerLabel={t("image.uploader.trigger")}
            />

            <StyledDrawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
                slotProps={{
                    paper: {
                        sx: {
                            width: DRAWER_WIDTH,
                            display: "flex",
                            flexDirection: "column",
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: 1,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        flexShrink: 0,
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={1}>
                        <UploadFileIcon
                            sx={{ fontSize: 18, color: "primary.main" }}
                        />
                        <StyledTypography variant="subtitle2" fontWeight={700}>
                            {t("image.uploader.drawerTitle")}
                        </StyledTypography>
                    </Stack>
                    <IconButton
                        size="small"
                        onClick={() => setOpen(false)}
                        sx={{ color: "text.disabled" }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Box>
                        <DropZone
                            onFiles={handleFiles}
                            accept={BLOG_IMAGE_CONFIG.allowedMimeTypes}
                            multiple
                        />
                    </Box>
                    <UploadQueue
                        uploads={uploads}
                        busy={active.length > 0 || waiting > 0}
                        done={done}
                        total={total}
                        errors={errors}
                        cancellableCount={cancellableCount}
                        hasFinished={hasFinished}
                        fileIcon={(color) => (
                            <ImageIcon sx={{ fontSize: 17, color }} />
                        )}
                        onRemove={(id) =>
                            setUploads((prev) =>
                                prev.filter((u) => u.id !== id),
                            )
                        }
                        onCancel={(id) => abortRefs.current[id]?.abort()}
                        onCancelAll={() =>
                            Object.values(abortRefs.current).forEach((c) =>
                                c.abort(),
                            )
                        }
                        onClearFinished={() =>
                            setUploads((prev) =>
                                prev.filter((u) => !isFinished(u.status)),
                            )
                        }
                    />
                </Box>
            </StyledDrawer>
        </>
    );
}
