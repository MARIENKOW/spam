import { Box, CircularProgress } from "@mui/material";

export default function LoadingElement() {
    return (
        <Box
            flex={1}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
        >
            <CircularProgress />
        </Box>
    );
}
