import style from "./BlogItem.module.css";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import { BlogDto } from "@myorg/shared/dto";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { ClientDate } from "@/components/common/ClientDate";

export const BlogItemContent = ({ blog }: { blog: BlogDto }) => {
    return (
        <CardContent
            sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                p: 0,
                pb: "0 !important",
                minWidth: 0,
            }}
        >
            <CardMedia
                sx={{
                    width: "100%",
                    aspectRatio: "16 / 6",
                    flexShrink: 0,
                }}
                image={blog.image?.url || "/default.png"}
                title="Blog image"
            />

            <Box
                sx={{
                    p: 2,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    minWidth: 0,
                }}
            >
                <StyledTypography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        lineHeight: 1.3,
                        color: "text.primary",
                    }}
                >
                    {blog.title}
                </StyledTypography>

                <Box>
                    <ClientDate
                        variant="caption"
                        color="text.disabled"
                        component={"span"}
                        sx={{ cursor: "default" }}
                        tooltipProps={{ placement: "bottom", arrow: true }}
                        date={blog.publishedAt}
                    />
                </Box>
                <Box
                    component="div"
                    className={style.subtitle}
                    dangerouslySetInnerHTML={{ __html: blog.body }}
                    sx={{
                        typography: "body2",
                        mt: 0.5,
                        minWidth: 0,
                        maxHeight: "66px",
                    }}
                />
            </Box>
        </CardContent>
    );
};
