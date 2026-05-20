import { ImageControl } from "@/components/TextEditor/components/image/ImageControl";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { imageKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { ImageDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

export function ImageList({
    data,
    error,
}: {
    data?: ImageDto[];
    error: unknown;
}) {
    const queryClient = useQueryClient();

    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({
                        queryKey: imageKeys.lists(),
                    })
                }
                error={error}
            />
        );
    if (data && data.length === 0)
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
                        <ImageControl image={e} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
