import InvitationItem from "@/components/invitation/InvitationItem";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { invitationKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
    data?: AdminInvitationDto[];
    error: unknown;
}

export function InvitationList({ data, error }: Props) {
    const queryClient = useQueryClient();

    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({
                        queryKey: invitationKeys.all,
                    })
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
            <Grid container spacing={1.5} columns={{ xs: 1, md: 2,lg: 3 }}>
                {data?.map((inv) => (
                    <Grid size={1} key={inv.id}>
                        <InvitationItem inv={inv} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
