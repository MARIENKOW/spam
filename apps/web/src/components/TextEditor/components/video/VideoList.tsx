import { VideoControl } from "@/components/TextEditor/components/video/VideoControl";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { videoKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { VideoDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

export function VideoList({
    data,
    error,
}: {
    data?: VideoDto[];
    error: unknown;
}) {
    const queryClient = useQueryClient();
    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({
                        queryKey: videoKeys.lists(),
                    })
                }
                error={error}
            />
        );
    if (data && data.length == 0)
        return (
            <Box display={"flex"} flexDirection={"column"} flex={1} py={10}>
                <EmptyElement />
            </Box>
        );
    return (
        <Box display="flex" flexDirection="column" flex={1}>
            <Grid container spacing={1.5} columns={{ xs: 1, sm: 2, md: 3 }}>
                {data?.map((e) => (
                    <Grid size={1} key={e.id}>
                        <VideoControl video={e} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
