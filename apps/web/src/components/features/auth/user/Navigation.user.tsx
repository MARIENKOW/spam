"use client";

import LogoutMenuItem from "@/components/features/auth/user/LogoutMenuItem.user";
import { StyledAvatar } from "@/components/ui/StyledAvatar";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { StyledListItemText } from "@/components/ui/StyledListItemText";
import { StyledMenu } from "@/components/ui/StyledMenu";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { Link } from "@/i18n/navigation";
import { Box, ButtonBase } from "@mui/material";
import { UserDto } from "@myorg/shared/dto";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { StyledButton } from "@/components/ui/StyledButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useUserAuth } from "@/components/wrappers/auth/UserAuthProvider";

export default function NavigationUser() {
    const [open, setOpen] = useState<boolean>(false);
    const t = useTranslations();
    const { user } = useUserAuth();
    const menuRef = useRef(null);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleCLose = () => {
        setOpen(false);
    };
    return (
        <>
            <StyledTooltip title={t("pages.profile.name")}>
                <StyledIconButton
                    size="small"
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    ref={menuRef}
                    sx={{ overflow: "hidden", borderRadius: 999 }}
                    onClick={handleOpen}
                >
                    <StyledAvatar
                        src={user?.avatar?.url ?? undefined}
                    ></StyledAvatar>
                </StyledIconButton>
            </StyledTooltip>
            <StyledMenu
                anchorEl={menuRef.current}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                onClose={handleCLose}
                open={open}
            >
                <Box
                    pl={1}
                    pr={1}
                    pb={1}
                    display={"flex"}
                    flexDirection={"column"}
                    gap={1}
                >
                    <Box alignItems={"center"} display={"flex"} gap={2}>
                        <Box>
                            <StyledTypography p={1}>
                                {user?.email}
                            </StyledTypography>
                        </Box>
                    </Box>
                    <Link href={FULL_PATH_ROUTE.profile.path}>
                        <StyledButton
                            fullWidth
                            onClick={handleCLose}
                            size="small"
                            variant="contained"
                        >
                            {t("pages.profile.name")}
                        </StyledButton>
                    </Link>
                </Box>

                <StyledDivider />
                <Link href={FULL_PATH_ROUTE.profile.settings.path}>
                    <StyledMenuItem onClick={handleCLose}>
                        <StyledListItemIcon>
                            <SettingsOutlinedIcon />
                        </StyledListItemIcon>
                        <StyledListItemText>
                            {t("pages.profile.settings.name")}
                        </StyledListItemText>
                    </StyledMenuItem>
                </Link>
                <LogoutMenuItem />
            </StyledMenu>
        </>
    );
}
