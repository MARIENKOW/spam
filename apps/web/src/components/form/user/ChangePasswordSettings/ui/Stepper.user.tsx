"use client";

import {
    Box,
    Chip,
    MobileStepper,
    Step,
    StepLabel,
    Stepper,
    useTheme,
    StepIconProps,
} from "@mui/material";
import { LockOutlined, MailOutline, CheckRounded } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { MessageKeyType } from "@myorg/shared/i18n";
import { StyledTypography } from "@/components/ui/StyledTypography";

export const STEPS: { labelKey: MessageKeyType; icon: React.ReactNode }[] = [
    {
        labelKey: "features.changePassword.step1",
        icon: <LockOutlined fontSize="small" />,
    },
    {
        labelKey: "features.changePassword.step2",
        icon: <MailOutline fontSize="small" />,
    },
];

function StepIcon({
    active,
    completed,
    icon,
}: StepIconProps & { icon: React.ReactNode }) {
    const theme = useTheme();

    const color =
        completed || active
            ? theme.palette.primary.main
            : theme.palette.action.disabled;

    const bg = completed
        ? `${theme.palette.primary.main}18`
        : active
          ? `${theme.palette.primary.main}12`
          : "transparent";

    return (
        <Box
            sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bg,
                border: "1.5px solid",
                borderColor:
                    completed || active
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                color,
                transition: theme.transitions.create(
                    ["background-color", "border-color", "color"],
                    { duration: theme.transitions.duration.short },
                ),
            }}
        >
            {completed ? <CheckRounded fontSize="small" /> : icon}
        </Box>
    );
}

// ── Основной компонент ────────────────────────────────────────────────────────

interface Props {
    activeStep: number;
}

export default function ChangePasswordStepper({ activeStep }: Props) {
    const t = useTranslations();
    const theme = useTheme();

    return (
        <>
            <Stepper
                activeStep={activeStep}
                sx={{
                    display: { xs: "none", sm: "flex" },
                    // Линия между шагами
                    "& .MuiStepConnector-line": {
                        borderColor: theme.palette.divider,
                        borderTopWidth: 1.5,
                        transition: theme.transitions.create("border-color", {
                            duration: theme.transitions.duration.short,
                        }),
                    },
                    "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
                        {
                            borderColor: theme.palette.primary.main,
                        },
                    "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line":
                        {
                            borderColor: `${theme.palette.primary.main}60`,
                        },
                }}
            >
                {STEPS.map((s, idx) => (
                    <Step key={idx} completed={activeStep > idx}>
                        <StepLabel
                            slots={{
                                stepIcon: (props) => (
                                    <StepIcon {...props} icon={s.icon} />
                                ),
                            }}
                        >
                            <StyledTypography
                                variant="caption"
                                color={
                                    activeStep >= idx
                                        ? "primary.main"
                                        : "text.secondary"
                                }
                                fontWeight={
                                    activeStep === idx
                                        ? theme.typography.fontWeightBold
                                        : theme.typography.fontWeightRegular
                                }
                                sx={{
                                    transition: theme.transitions.create(
                                        ["color", "font-weight"],
                                        {
                                            duration:
                                                theme.transitions.duration
                                                    .short,
                                        },
                                    ),
                                }}
                            >
                                {t(s.labelKey)}
                            </StyledTypography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box display={{ xs: "block", sm: "none" }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={theme.spacing(0.75)}
                >
                    <StyledTypography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={theme.typography.fontWeightMedium}
                    >
                        {t(STEPS[activeStep].labelKey)}
                    </StyledTypography>
                    <Chip
                        label={`${activeStep + 1} / ${STEPS.length}`}
                        size="small"
                        sx={{
                            height: theme.spacing(2.5),
                            fontSize: theme.typography.caption.fontSize,
                            bgcolor: `${theme.palette.primary.main}14`,
                            color: "primary.main",
                            fontWeight: theme.typography.fontWeightMedium,
                            border: "none",
                        }}
                    />
                </Box>
                <MobileStepper
                    variant="progress"
                    steps={STEPS.length}
                    position="static"
                    activeStep={activeStep}
                    nextButton={null}
                    backButton={null}
                    sx={{
                        p: 0,
                        bgcolor: "transparent",
                        "& .MuiMobileStepper-progress": {
                            width: "100%",
                            borderRadius: theme.shape.borderRadius,
                            bgcolor: `${theme.palette.primary.main}18`,
                            "& .MuiLinearProgress-bar": {
                                borderRadius: theme.shape.borderRadius,
                            },
                        },
                    }}
                />
            </Box>
        </>
    );
}
