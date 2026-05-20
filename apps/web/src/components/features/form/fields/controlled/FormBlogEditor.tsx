import { FormFieldProps } from "@/components/features/form/fields/types";
import BlogForm from "@/components/form/BlogForm";
import BlogEditor from "@/components/TextEditor/BlogEditor";
import { StyledFormControl } from "@/components/ui/StyledFormControl";
import { StyledFormHelperText } from "@/components/ui/StyledFormHelperText";
import { StyledTextField } from "@/components/ui/StyledTextField";
import FieldControll from "@/components/wrappers/form/FieldControll";
import { useFormConfig } from "@/components/wrappers/form/FormConfigProvider";
import { MessageKeyType } from "@myorg/shared/i18n";
import { useTranslations } from "next-intl";
import { FieldValues, Path, RegisterOptions } from "react-hook-form";

export default function FormBlogEditor<TFieldValues extends FieldValues>({
    name,
    onImagesChange,
    onVideosChange,
}: FormFieldProps<TFieldValues> & {
    onImagesChange: (images: string[]) => void;
    onVideosChange: (videos: string[]) => void;
}) {
    const t = useTranslations();

    return (
        <FieldControll name={name}>
            {({ field, fieldState: { error } }) => (
                <StyledFormControl
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                    error={!!error?.message}
                >
                    <BlogEditor
                        error={!!error}
                        value={field.value}
                        onChange={field.onChange}
                        onImagesChange={onImagesChange}
                        onVideosChange={onVideosChange}
                    />

                    <StyledFormHelperText>
                        {error?.message
                            ? t(error.message as MessageKeyType)
                            : undefined}
                    </StyledFormHelperText>
                </StyledFormControl>
            )}
        </FieldControll>
    );
}
