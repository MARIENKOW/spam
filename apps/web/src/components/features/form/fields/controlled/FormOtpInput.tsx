import { FormFieldProps } from "@/components/features/form/fields/types";
import OtpInput from "@/components/features/form/fields/uncontrolled/OtpInput";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { StyledTypography } from "@/components/ui/StyledTypography";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { Box } from "@mui/material";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues } from "react-hook-form";

export type FormOtpInputProps = {
    name: string;
    label: MessageKeyType;
    length: number;
};

export default function FormOtpInput({
    name,
    label,
    length,
}: FormOtpInputProps) {
    const t = useTranslations();

    return (
        <FieldControll name={name}>
            {({ field, fieldState: { error } }) => (
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    alignItems={"center"}
                >
                    <StyledTypography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        letterSpacing="0.06em"
                        mb={2}
                        textTransform="uppercase"
                    >
                        {t(label)}
                    </StyledTypography>
                    <OtpInput length={length} error={!!error} {...field} />
                    {error && (
                        <StyledFormHelperText
                            error={!!error}
                            sx={{ textAlign: "center" }}
                        >
                            {error?.message
                                ? t(error.message as MessageKeyType)
                                : undefined}
                        </StyledFormHelperText>
                    )}
                </Box>
            )}
        </FieldControll>
    );
}
