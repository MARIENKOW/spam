import { NavGroup } from "@/components/layout/navigation/types";
import {
    PersonOutline,
    LockOutlined,
    SecurityOutlined,
} from "@mui/icons-material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

export const NAV_GROUPS: NavGroup[] = [
    {
        label: "pages.profile.settings.groups.account",
        items: [
            {
                label: "pages.profile.settings.profile.name",
                href: FULL_PATH_ROUTE.profile.settings.profile.path,
                activeLink: {
                    strict: [
                        FULL_PATH_ROUTE.profile.settings.profile.path,
                        FULL_PATH_ROUTE.profile.settings.path,
                    ],
                },
                icon: <PersonOutline />,
            },
            {
                label: "pages.profile.settings.password.name",
                href: FULL_PATH_ROUTE.profile.settings.password.path,
                activeLink: {
                    strict: [FULL_PATH_ROUTE.profile.settings.password.path],
                },
                icon: <LockOutlined />,
            },
        ],
    },
    {
        label: "pages.profile.settings.groups.other",
        items: [
            {
                label: "pages.profile.settings.sessions.name",
                href: FULL_PATH_ROUTE.profile.settings.sessions.path,
                activeLink: {
                    strict: [FULL_PATH_ROUTE.profile.settings.sessions.path],
                },
                icon: <SecurityOutlined />,
            },
        ],
    },
];

// export const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
