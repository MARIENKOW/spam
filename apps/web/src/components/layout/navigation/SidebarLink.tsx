"use client";

import { NavItem } from "@/components/layout/navigation/types";
import { StyledListItemButton } from "@/components/ui/StyledListItemButton";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { StyledListItemText } from "@/components/ui/StyledListItemText";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function SidebarLink({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const isActive =
        item.activeLink?.strict?.includes(pathname) ||
        item.activeLink?.safe?.some((prefix) => pathname.startsWith(prefix));
    const t = useTranslations();
    return (
        <Link href={item.href}>
            <StyledListItemButton
                key={item.label}
                selected={isActive}
                sx={{
                    borderRadius: 2,
                    mb: 0.5,
                }}
            >
                <StyledListItemIcon
                    sx={{
                        minWidth: 36,
                        color: "text.secondary",
                    }}
                >
                    {item.icon}
                </StyledListItemIcon>
                <StyledListItemText primary={t(item.label)} />
            </StyledListItemButton>
        </Link>
    );
}
