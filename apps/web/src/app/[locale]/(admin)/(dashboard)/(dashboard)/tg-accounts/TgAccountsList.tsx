import TgAccountCard from "@/components/tg-account/TgAccountCard";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { tgAccountKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { TgAccountDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/wrappers/auth/AdminAuthProvider";

export function TgAccountsList({
    data,
    error,
}: {
    data?: TgAccountDto[];
    error: unknown;
}) {
    const queryClient = useQueryClient();
    const { admin } = useAdminAuth();
    const showOwner = admin?.role === "SUPERADMIN";

    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({ queryKey: tgAccountKeys.lists() })
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
            <Grid container spacing={1.5} columns={{ xs: 1, sm: 2, lg: 3 }}>
                {data?.map((account) => (
                    <Grid size={1} key={account.id}>
                        <TgAccountCard account={account} showOwner={showOwner} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
