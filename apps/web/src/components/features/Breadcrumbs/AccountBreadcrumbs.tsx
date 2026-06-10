"use client";

import { useTgAccountDetail } from "@/hooks/tanstack/useTgAccountDetail";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";
import BreadcrumbsComponent from "./BreadcrumbsComponent";

interface Props {
    accountId: string;
    extra?: { name: string; href: string; }[];
}

export default function AccountBreadcrumbs({ accountId, extra = [] }: Props) {
    const t = useTranslations();
    const { data: account } = useTgAccountDetail(accountId);

    const accountLabel = account
        ? (account.username ? `@${account.username}` : [account.firstName, account.lastName].filter(Boolean).join(" "))
        : "…";

    const tgAccountsHref = FULL_PATH_ROUTE.admin.tgAccounts.path;
    const accountHref = `${tgAccountsHref}/${accountId}`;

    const accountsItem = { name: t("pages.admin.tgAccounts.name"), href: tgAccountsHref, key: "accounts" };
    const accountItem = { name: accountLabel, href: accountHref, key: "account" };
    const extraItems = extra.map((e, i) => ({ ...e, key: `extra-${i}` }));

    return (
        <>
            <Box mb={4} display={{ xs: "block", md: "none" }}>
                <BreadcrumbsComponent options={[
                    { name: t("pages.admin.name"), href: FULL_PATH_ROUTE.admin.path, key: "home" },
                    accountsItem,
                    accountItem,
                    ...extraItems,
                ]} />
            </Box>
            <Box mb={4} display={{ xs: "none", md: "block" }}>
                <BreadcrumbsComponent options={[accountsItem, accountItem, ...extraItems]} />
            </Box>
        </>
    );
}
