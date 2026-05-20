"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import { CropArea, getCroppedBlob } from "./crop.utils";
import { errorHandler } from "@/helpers/error/error.handler.helper";
import { useTranslations } from "next-intl";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledSlider } from "@/components/ui/StyledSlider";
import { StyledDialog } from "@/components/ui/StyledDialog";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AvatarCropDialogProps {
    src: string | null;
    onConfirm: (file: File) => void;
    onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvatarCropDialog({
    src,
    onConfirm,
    onCancel,
}: AvatarCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const t = useTranslations();
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
        null,
    );
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropComplete = useCallback((_: CropArea, pixels: CropArea) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        if (!src || !croppedAreaPixels) return errorHandler({ error:{}, t });

        setIsProcessing(true);
        try {
            const blob = await getCroppedBlob(src, croppedAreaPixels, rotation);
            const file = new File([blob], "avatar.webp", {
                type: "image/webp",
            });
            onConfirm(file);
        } catch (error) {
            errorHandler({ error, t });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <StyledDialog
            open={!!src}
            onClose={() => !isProcessing && onCancel()}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Crop area */}
                <Box
                    sx={{
                        position: "relative",
                        height: 340,
                    }}
                >
                    {src && (
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </Box>

                {/* Controls */}
                <Box
                    sx={{
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {/* Zoom */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <ZoomOutIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                        />
                        <StyledSlider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.05}
                            onChange={(_, v) => setZoom(v as number)}
                            size="small"
                        />
                        <ZoomInIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                        />
                    </Box>

                    {/* Rotation */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <StyledIconButton
                            size="small"
                            onClick={() =>
                                setRotation((r) => (r - 90 + 360) % 360)
                            }
                            disabled={isProcessing}
                        >
                            <RotateLeftIcon fontSize="small" />
                        </StyledIconButton>
                        <StyledSlider
                            value={rotation}
                            min={-180}
                            max={180}
                            step={1}
                            onChange={(_, v) => setRotation(v as number)}
                            size="small"
                            disabled={isProcessing}
                        />
                        <StyledIconButton
                            size="small"
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            disabled={isProcessing}
                        >
                            <RotateRightIcon fontSize="small" />
                        </StyledIconButton>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <StyledButton
                    variant="outlined"
                    color="error"
                    onClick={onCancel}
                >
                    {t("common.cancel")}
                </StyledButton>
                <StyledButton
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    startIcon={
                        isProcessing ? (
                            <CircularProgress size={14} color="inherit" />
                        ) : undefined
                    }
                >
                    {t("common.confirm")}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
}
