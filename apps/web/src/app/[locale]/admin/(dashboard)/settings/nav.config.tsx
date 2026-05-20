import { NavGroup } from "@/components/layout/navigation/types";
import {
    PersonOutline,
    LockOutlined,
    SecurityOutlined,
} from "@mui/icons-material";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";

export const NAV_GROUPS: NavGroup[] = [
    {
        label: "pages.admin.settings.groups.account",
        items: [
            {
                label: "pages.admin.settings.profile.name",
                href: FULL_PATH_ROUTE.admin.settings.profile.path,
                activeLink: {
                    strict: [
                        FULL_PATH_ROUTE.admin.settings.profile.path,
                        FULL_PATH_ROUTE.admin.settings.path,
                        FULL_PATH_ROUTE.admin.path,
                    ],
                },
                icon: <PersonOutline />,
            },
            {
                label: "pages.admin.settings.password.name",
                href: FULL_PATH_ROUTE.admin.settings.password.path,
                activeLink: {
                    strict: [FULL_PATH_ROUTE.admin.settings.password.path],
                },
                icon: <LockOutlined />,
            },
        ],
    },
    {
        label: "pages.admin.settings.groups.other",
        items: [
            {
                label: "pages.admin.settings.sessions.name",
                href: FULL_PATH_ROUTE.admin.settings.sessions.path,
                activeLink: {
                    strict: [FULL_PATH_ROUTE.admin.settings.sessions.path],
                },
                icon: <SecurityOutlined />,
            },
        ],
    },
];

// export const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
