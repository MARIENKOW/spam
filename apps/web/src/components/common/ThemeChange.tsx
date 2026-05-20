"use client";
import { Box, styled, Switch } from "@mui/material";
import { useThemeContext } from "@/theme/ThemeRegistry";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { AvailableMode } from "@/theme/theme";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { useTranslations } from "next-intl";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 45,
    height: 25,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        top: "50%",
        transform: "translate(-3px,-50%)",
        // transform: "translate(8px,-50%)",
        "&.Mui-checked": {
            transform: "translate(17px,-50%)",
            // transform: "translate(37px,-50%)",

            "& + .MuiSwitch-track": {
                opacity: 1,
            },
        },
    },
    "& .MuiSwitch-thumb": {
        // width: 32,
        // height: 32,
    },
    "& .MuiSwitch-track": {
        opacity: 0.1,
        borderRadius: 99,
    },
}));
// const userFetch = new UserService($apiUserClient);

export default function ThemeChange({
    serverMode,
}: {
    serverMode: AvailableMode;
}) {
    const { themeMode, changeTheme } = useThemeContext(serverMode);

    // const { user } = useUserAuth();
    const t = useTranslations();
    const handleChange = async (newMode: AvailableMode) => {
        changeTheme(newMode);
        // if (user) userFetch.changeTheme({ theme: newMode }).catch(() => {});
    };
    // useEffect(() => {
    //     changeTheme(serverMode);
    // }, [serverMode]);
    return (
        <StyledTooltip title={t("features.theme.name")}>
            <Box display={"inline-flex"}>
                <MaterialUISwitch
                    checked={themeMode === "dark"}
                    icon={
                        <Box
                            display={"flex"}
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            <LightModeOutlinedIcon
                                fontSize="small"
                                sx={{
                                    color: "text.primary",
                                    width: 15,
                                    height: 15,
                                }}
                            />
                        </Box>
                    }
                    checkedIcon={
                        <Box
                            display={"flex"}
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            <ModeNightIcon
                                fontSize="small"
                                sx={{
                                    color: "text.primary",
                                    width: 15,
                                    height: 15,
                                }}
                            />
                        </Box>
                    }
                    size="medium"
                    onChange={() =>
                        handleChange(themeMode === "dark" ? "light" : "dark")
                    }
                />
            </Box>
        </StyledTooltip>
    );
}
