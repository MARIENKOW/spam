"use client";

import AdminManagementItem from "@/components/admin/management/AdminManagementItem";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { adminKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { AdminManagementDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
    data?: AdminManagementDto[];
    error: unknown;
}

export function AdminList({ data, error }: Props) {
    const queryClient = useQueryClient();

    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({ queryKey: adminKeys.all })
                }
                error={error}
            />
        );

    if (data && data.length === 0)
        return (
            <Box display="flex" flexDirection="column" flex={1} py={10}>
                <EmptyElement />
            </Box>
        );

    return (
        <Box display="flex" flexDirection="column" flex={1}>
            <Grid container spacing={1.5} columns={{ xs: 1, md: 2, lg: 3 }}>
                {data?.map((admin) => (
                    <Grid size={1} key={admin.id}>
                        <AdminManagementItem admin={admin} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
