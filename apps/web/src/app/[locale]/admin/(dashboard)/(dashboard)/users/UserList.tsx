"use client";

import UserManagementItem from "@/components/admin/userManagement/UserManagementItem";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { userKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { UserManagementDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
    data?: UserManagementDto[];
    error: unknown;
}

export function UserList({ data, error }: Props) {
    const queryClient = useQueryClient();

    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() => queryClient.invalidateQueries({ queryKey: userKeys.all })}
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
                {data?.map((user) => (
                    <Grid size={1} key={user.id}>
                        <UserManagementItem user={user} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
