"use client";

import { StyledPagination } from "@/components/ui/StyledPagination";

interface PaginationProps {
    page: number;
    count: number;
    onChange: (page: number) => void;
    disabled?: boolean;
}

export const PaginationComponent = ({
    page,
    count,
    onChange,
    disabled,
}: PaginationProps) => {
    if (count < 2) return null;

    return (
        <StyledPagination
            page={page}
            count={count}
            disabled={disabled}
            onChange={(_, value) => onChange(value)}
            color="primary"
            shape="rounded"
            sx={{ alignSelf: "center" }}
        />
    );
};
