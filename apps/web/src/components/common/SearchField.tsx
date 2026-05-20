"use client";

import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { useDebounce } from "@/hooks/useDebounce";
import { InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
    const t = useTranslations();
    const [input, setInput] = useState(value);
    const debounced = useDebounce(input);

    useEffect(() => {
        onChange(debounced);
    }, [debounced]);

    return (
        <StyledTextField
            size="small"
            fullWidth
            placeholder={placeholder ?? t("common.search")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                    endAdornment: input ? (
                        <InputAdornment position="end">
                            <StyledIconButton
                                size="small"
                                onClick={() => setInput("")}
                            >
                                <ClearIcon fontSize="small" />
                            </StyledIconButton>
                        </InputAdornment>
                    ) : undefined,
                },
            }}
        />
    );
}
