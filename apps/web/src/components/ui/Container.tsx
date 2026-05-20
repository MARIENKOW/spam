import { Box, Container, ContainerProps } from "@mui/material";
import React from "react";

export const ContainerComponent = ({
    children,
    marging = true,
    px = true,
    py = true,
    maxWidth = "lg",
}: {
    maxWidth?: ContainerProps["maxWidth"] | false;
    py?: boolean;
    px?: boolean;
    marging?: boolean;
    children: React.ReactNode;
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                py: { xs: py ? 2 : 0, md: py ? 4 : 0 },
                px: { xs: px ? 2 : 0, md: px ? 4 : 0 },
            }}
        >
            {maxWidth ? (
                <Container
                    sx={{
                        p: "0px !important",
                        mx: marging ? "auto" : 0,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                    }}
                    maxWidth={maxWidth}
                >
                    {children}
                </Container>
            ) : (
                children
            )}
        </Box>
    );
};
