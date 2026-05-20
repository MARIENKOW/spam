"use client";

import { useRef } from "react";
import { StyledButton } from "@/components/ui/StyledButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ButtonProps } from "@mui/material";

export interface UploadButtonProps extends ButtonProps {
    accept: string[];
    label?: string;
    error?: boolean;
    onFiles: (files: File[]) => void;
}

export function UploadButton({
    accept,
    label,
    error,
    onFiles,
    ...btnProps
}: UploadButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onFiles(files);
        e.target.value = "";
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept.join(",")}
                style={{ display: "none" }}
                onChange={handleChange}
            />
            <StyledButton
                color={error ? "error" : (btnProps.color ?? "primary")}
                startIcon={<CloudUploadIcon />}
                onClick={() => inputRef.current?.click()}
                {...btnProps}
            >
                {label}
            </StyledButton>
        </>
    );
}
