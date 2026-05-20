"use client";

import { Box, Card, CardContent } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { AdminInvitationDto } from "@myorg/shared/dto";
import { useTranslations } from "next-intl";
import { CopyToClipboard } from "@/components/features/CopyToClipboard";
import { InvitationNote } from "@/components/invitation/InvitationNote";
import { StyledDivider } from "@/components/ui/StyledDivider";
import { ResendInvitationButton } from "@/components/invitation/actions/ResendInvitationButton";
import { RevokeInvitationButton } from "@/components/invitation/actions/RevokeInvitationButton";
import { UnrevokeInvitationButton } from "@/components/invitation/actions/UnrevokeInvitationButton";
import { DeleteInvitationButton } from "@/components/invitation/actions/DeleteInvitationButton";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { StyledChip } from "@/components/ui/StyledChip";
import { ClientDate } from "@/components/common/ClientDate";
import { ClientCountdown } from "@/components/common/ClientCountdown";
import { smartDate } from "@myorg/shared/utils";

function StatusChip({ inv }: { inv: AdminInvitationDto }) {
    const t = useTranslations();
    if (inv.isRevoked)
        return (
            <StyledChip
                label={t("pages.admin.invitation.status.revoked")}
                size="small"
                color="error"
                variant="outlined"
            />
        );
    if (inv.isExpired)
        return (
            <StyledChip
                label={t("pages.admin.invitation.status.expired")}
                size="small"
                color="warning"
                variant="outlined"
            />
        );
    return (
        <StyledChip
            label={t("pages.admin.invitation.status.active")}
            size="small"
            color="success"
            variant="outlined"
        />
    );
}

function ExpiryLabel({ inv }: { inv: AdminInvitationDto }) {
    const t = useTranslations();

    if (inv.isRevoked)
        return (
            <ClientDate
                date={inv.revokedAt!}
                variant="caption"
                color="text.disabled"
                format={(d, locale) =>
                    t("pages.admin.invitation.revokedAt", {
                        time: smartDate({ date: d, locale }),
                    })
                }
            />
        );

    if (inv.isExpired)
        return (
            <ClientDate
                date={inv.expiresAt}
                variant="caption"
                color="warning.main"
                format={(d, locale) =>
                    t("pages.admin.invitation.expiredAt", {
                        time: smartDate({ date: d, locale }),
                    })
                }
            />
        );

    return (
        <ClientCountdown
            expiresAt={inv.expiresAt}
            variant="caption"
            color="text.disabled"
            formatLabel={(time) => t("pages.admin.invitation.expiresAt", { time })}
        />
    );
}

export default function InvitationItem({ inv }: { inv: AdminInvitationDto }) {
    const t = useTranslations();

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                borderColor: inv.isRevoked
                    ? "error.main"
                    : inv.isExpired
                      ? "warning.main"
                      : "success.main",
                opacity: inv.isRevoked || inv.isExpired ? 0.75 : 1,
                transition: "border-color 0.2s",
            }}
        >
            <CardContent
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    pb: "0px !important",
                }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                    mb={1.5}
                >
                    <EmailIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                    />
                    <StyledTypography
                        variant="body2"
                        fontWeight={600}
                        sx={{ flex: 1, wordBreak: "break-all" }}
                    >
                        {inv.email}
                    </StyledTypography>
                    <StatusChip inv={inv} />
                </Box>

                <Box mb={1.5}>
                    <ExpiryLabel inv={inv} />
                </Box>

                <CopyToClipboard
                    value={inv.url}
                    successMessage={t("pages.admin.invitation.linkCopied")}
                    disabled={inv.isRevoked || inv.isExpired}
                />

                <Box flex={1} mt={1.5}>
                    <InvitationNote inv={inv} />
                </Box>

                <StyledDivider sx={{ mt: 1.5 }} />
                <Box py={1}  display="flex" justifyContent="flex-end" gap={0.5}>
                    {!inv.isRevoked && (
                        <ResendInvitationButton invId={inv.id} />
                    )}
                    {!inv.isRevoked && (
                        <RevokeInvitationButton invId={inv.id} />
                    )}
                    {inv.isRevoked && (
                        <UnrevokeInvitationButton invId={inv.id} />
                    )}
                    <DeleteInvitationButton invId={inv.id} />
                </Box>
            </CardContent>
        </Card>
    );
}
