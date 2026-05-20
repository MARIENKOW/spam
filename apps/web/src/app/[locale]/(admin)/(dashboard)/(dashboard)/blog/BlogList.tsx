import BlogItem from "@/components/blog/item/BlogItem";
import EmptyElement from "@/components/feedback/EmptyElement";
import ErrorHandlerElement from "@/components/feedback/error/ErrorHandlerElement";
import { blogKeys } from "@/lib/tanstack/keys";
import { Box, Grid } from "@mui/material";
import { BlogDto } from "@myorg/shared/dto";
import { useQueryClient } from "@tanstack/react-query";

export function BlogList({
    data,
    error,
}: {
    data?: BlogDto[];
    error: unknown;
}) {
    const queryClient = useQueryClient();
    if (error && (!data || data.length === 0))
        return (
            <ErrorHandlerElement
                reset={() =>
                    queryClient.invalidateQueries({
                        queryKey: blogKeys.lists(),
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
            <Grid container spacing={1.5} columns={{ xs: 1, md: 2,lg:3 }}>
                {data?.map((e) => (
                    <Grid size={1} key={e.id}>
                        <BlogItem key={e.id} blog={e} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
