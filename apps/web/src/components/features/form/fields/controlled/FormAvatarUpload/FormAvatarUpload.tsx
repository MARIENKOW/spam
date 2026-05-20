"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

import { AvatarProps } from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledAvatar } from "@/components/ui/StyledAvatar";
import { StyledMenu } from "@/components/ui/StyledMenu";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { FetchCustomReturn } from "@/utils/api";
import { useTranslations } from "next-intl";
import { MessageKeyType } from "@myorg/shared/i18n";
import AvatarCropDialog from "@/components/features/form/fields/controlled/FormAvatarUpload/AvatarCropDialog";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormAvatarUploadProps<T extends FieldValues> {
    name: Path<T>;
    urlPreview?: string;
    isSubmitting?: boolean;
    onDelete?: () => Promise<void>;
    sx?: AvatarProps["sx"];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormAvatarUpload<T extends FieldValues>({
    name,
    urlPreview,
    isSubmitting,
    onDelete,
    sx,
}: FormAvatarUploadProps<T>) {
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const t = useTranslations();
    const { control } = useFormContext<T>();

    const cropSrcRef = useRef<string | null>(null);

    const isLoading = isCropping || isDeleting || isSubmitting;

    // ── Drop ──────────────────────────────────────────────────────────────────

    const onDrop = useCallback((accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;

        if (cropSrcRef.current) {
            URL.revokeObjectURL(cropSrcRef.current);
        }

        const url = URL.createObjectURL(file);
        cropSrcRef.current = url;
        setCropSrc(url);
        setIsCropping(true);
    }, []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        open: openFilePicker,
    } = useDropzone({
        onDrop,
        multiple: false,
        disabled: !!isLoading,
        noClick: true,
        noKeyboard: true,
    });

    // ── Avatar click — всегда открывает файловый диалог ──────────────────────

    const handleAvatarClick = useCallback(() => {
        if (isLoading) return;
        openFilePicker();
    }, [isLoading, openFilePicker]);

    // ── FAB click — диалог если нет фото, иначе меню ─────────────────────────

    const handleFabClick = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            // Останавливаем всплытие чтобы не сработал handleAvatarClick на родителе
            e.stopPropagation();
            if (isLoading) return;
            if (!urlPreview) {
                openFilePicker();
                return;
            }
            setMenuAnchor(e.currentTarget);
        },
        [isLoading, urlPreview, openFilePicker],
    );

    const handleMenuClose = useCallback(() => setMenuAnchor(null), []);

    const handleMenuChange = useCallback(() => {
        handleMenuClose();
        openFilePicker();
    }, [handleMenuClose, openFilePicker]);

    // ── Crop ──────────────────────────────────────────────────────────────────

    const handleCropConfirm = useCallback(
        (onChange: (file: File) => void) => (file: File) => {
            onChange(file);

            if (cropSrcRef.current) {
                URL.revokeObjectURL(cropSrcRef.current);
                cropSrcRef.current = null;
            }

            setCropSrc(null);
            setIsCropping(false);
        },
        [],
    );

    const handleCropCancel = useCallback(() => {
        if (cropSrcRef.current) {
            URL.revokeObjectURL(cropSrcRef.current);
            cropSrcRef.current = null;
        }

        setCropSrc(null);
        setIsCropping(false);
    }, []);

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = useCallback(async () => {
        handleMenuClose();
        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete();
        } catch (error) {
            errorHandler({ error, t });
        } finally {
            setIsDeleting(false);
        }
    }, [onDelete, handleMenuClose]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange }, fieldState: { error } }) => (
                <>
                    <Box
                        display="inline-flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={0.5}
                    >
                        <Box
                            position="relative"
                            {...getRootProps()}
                            sx={{ outline: "none" }}
                        >
                            <input {...getInputProps()} accept="image/*" />

                            {/* Аватар — клик всегда открывает файловый диалог */}
                            <StyledAvatar
                                src={urlPreview}
                                onClick={handleAvatarClick}
                                sx={{
                                    width: 96,
                                    height: 96,
                                    cursor: isLoading ? "default" : "pointer",
                                    ...(isDragActive && {
                                        boxShadow: (theme) =>
                                            `0 0 0 3px ${theme.vars?.palette.primary.main}`,
                                        transform: "scale(1.04)",
                                    }),
                                    ...(error && {
                                        boxShadow: (theme) =>
                                            `0 0 0 2px ${theme.vars?.palette.error.main}`,
                                    }),
                                    transition:
                                        "box-shadow 0.2s, transform 0.2s",
                                    ...sx,
                                }}
                            />

                            {/* Loader overlay */}
                            {isLoading && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(0,0,0,0.45)",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <CircularProgress size={28} />
                                </Box>
                            )}

                            {/* FAB — меню с удалением (только если есть фото) */}
                            <StyledIconButton
                                onClick={handleFabClick}
                                disabled={!!isLoading}
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    p: 0,
                                }}
                            >
                                <Box
                                    display="inline-flex"
                                    sx={{
                                        borderRadius: 99,
                                        overflow: "hidden",
                                        bgcolor: "primary.main",
                                        p: 1,
                                    }}
                                >
                                    <EditOutlinedIcon
                                        sx={{ color: "primary.contrastText" }}
                                    />
                                </Box>
                            </StyledIconButton>
                        </Box>

                        {/* Ошибка поля */}
                        {error?.message && (
                            <StyledFormHelperText error>
                                {t(error.message as MessageKeyType)}
                            </StyledFormHelperText>
                        )}
                    </Box>

                    {/* Dropdown */}
                    <StyledMenu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        slotProps={{
                            paper: {
                                elevation: 2,
                                sx: { minWidth: 160, borderRadius: 2, mt: 0.5 },
                            },
                        }}
                    >
                        <StyledMenuItem onClick={handleMenuChange}>
                            <StyledListItemIcon>
                                <CameraAltOutlinedIcon fontSize="small" />
                            </StyledListItemIcon>
                            {t("features.avatar.change")}
                        </StyledMenuItem>

                        {onDelete && (
                            <StyledMenuItem
                                onClick={handleDelete}
                                sx={{ color: "error.main" }}
                            >
                                <StyledListItemIcon>
                                    <DeleteOutlineIcon
                                        fontSize="small"
                                        color="error"
                                    />
                                </StyledListItemIcon>
                                {t("features.avatar.delete")}
                            </StyledMenuItem>
                        )}
                    </StyledMenu>

                    {/* Crop dialog */}
                    <AvatarCropDialog
                        src={cropSrc}
                        onConfirm={handleCropConfirm(onChange)}
                        onCancel={handleCropCancel}
                    />
                </>
            )}
        />
    );
}
