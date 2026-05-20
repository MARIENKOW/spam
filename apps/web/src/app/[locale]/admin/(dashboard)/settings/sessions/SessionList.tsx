import { Box, Typography } from "@mui/material";
import { SessionAdminViewDto } from "@myorg/shared/dto";
import { getTranslations } from "next-intl/server";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { SessionCardAdmin } from "@/app/[locale]/admin/(dashboard)/settings/sessions/SessionCardAdmin";

interface SessionListProps {
    sessions?: SessionAdminViewDto[];
    onRevoke?: (id: string) => void;
}

export const SessionList = async ({ sessions }: SessionListProps) => {
    const t = await getTranslations("components.sessionList");

    const current = sessions?.find((s) => s.isCurrent);
    const others = sessions?.filter((s) => !s.isCurrent) ?? [];

    if (!sessions?.length) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={4}
            >
                {t("empty")}
            </Typography>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Текущая сессия */}
            {current && (
                <Box>
                    <StyledTypography
                        variant="overline"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1, letterSpacing: 1 }}
                    >
                        {t("currentSession")}
                    </StyledTypography>
                    <SessionCardAdmin session={current} />
                </Box>
            )}

            {/* Другие сессии */}
            {others.length > 0 && (
                <Box>
                    <StyledTypography
                        variant="overline"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1, letterSpacing: 1 }}
                    >
                        {t("otherSessions", { count: others.length })}
                    </StyledTypography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {others.map((session) => (
                            <SessionCardAdmin
                                key={session.id}
                                session={session}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};
