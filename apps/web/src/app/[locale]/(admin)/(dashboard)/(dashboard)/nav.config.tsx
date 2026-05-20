import { NavGroup } from "@/components/layout/navigation/types";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { AdminDto } from "@myorg/shared/dto";

export const NAV_GROUPS: (role: AdminDto["role"]) => NavGroup[] = (role) => [
    {
        items: [
            {
                label: "pages.admin.blog.name",
                href: FULL_PATH_ROUTE.admin.blog.path,
                activeLink: {
                    strict: [
                        FULL_PATH_ROUTE.admin.path,
                        // ...AllPathsFromRoute(FULL_PATH_ROUTE.admin.blog),
                    ],
                    safe: [FULL_PATH_ROUTE.admin.blog.path],
                },
                icon: <NewspaperIcon />,
            },
        ],
    },
    {
        items: [
            ...(role === "SUPERADMIN"
                ? [
                      {
                          label: "pages.admin.admins.name",
                          href: FULL_PATH_ROUTE.admin.admins.path,
                          activeLink: {
                              safe: [FULL_PATH_ROUTE.admin.admins.path],
                          },
                          icon: <PeopleIcon />,
                      },
                      {
                          label: "pages.admin.invitation.name",
                          href: FULL_PATH_ROUTE.admin.invitations.path,
                          activeLink: {
                              safe: [FULL_PATH_ROUTE.admin.invitations.path],
                          },
                          icon: <MailOutlineIcon />,
                      },
                  ]
                : []),
        ],
    },
];
