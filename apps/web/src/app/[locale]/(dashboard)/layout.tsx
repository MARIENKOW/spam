import HeaderUser from "@/components/layout/header/user/HeaderUser";
import UserAuthProvider from "@/components/wrappers/auth/UserAuthProvider";
import { getUserAuth } from "@/utils/cache/user.cache.me";
import { Box } from "@mui/material";
import React from "react";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, error } = await getUserAuth();
    return (
        <UserAuthProvider user={user} error={error}>
            <Box flex={1} display={"flex"} flexDirection={"column"}>
                <HeaderUser />
                <Box flex={1} display={"flex"} flexDirection={"column"}>
                    {children}
                </Box>
            </Box>
        </UserAuthProvider>
    );
}
