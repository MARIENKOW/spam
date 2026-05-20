import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import { StyledTypography } from "@/components/ui/StyledTypography";

export default function EmptyElement() {
    const t = useTranslations();
    return (
        <Box
            flex={1}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
            flexDirection={"column"}
            gap={2}
        >
            <InfoOutlineIcon sx={{ width: 50, height: 50 }} />
            <StyledTypography
                variant="h5"
                fontWeight={600}
                textAlign={"center"}
            >
                {t("feedback.empty.title")}
            </StyledTypography>
        </Box>
    );
}
