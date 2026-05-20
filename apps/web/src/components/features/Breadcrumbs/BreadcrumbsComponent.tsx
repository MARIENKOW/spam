"use client";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import style from "./breadcrumbs.module.css";
import { StyledLink } from "@/components/ui/StyledLink";
import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";

type BreadcrumbsObject = {
    href: string;
    name: string;
    key: any;
};

export default function BreadcrumbsComponent({
    options,
}: {
    options: BreadcrumbsObject[];
}) {
    const t = useTranslations();
    return (
        <Breadcrumbs
            maxItems={3}
            separator={<NavigateNextIcon color="primary" fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ "& ol": { flexWrap: "nowrap !important" } }}
        >
            {options?.map((e, i, arr) =>
                i !== arr.length - 1 ? (
                    <Link href={e.href}>
                        <StyledTypography
                            className={style.text}
                            key={e.key}
                            color={"primary"}
                        >
                            {e.name}
                        </StyledTypography>
                    </Link>
                ) : (
                    <StyledTypography
                        className={style.text}
                        key={e.key}
                        color={"text.seccondary"}
                    >
                        {e.name}
                    </StyledTypography>
                ),
            )}
        </Breadcrumbs>
    );
}
