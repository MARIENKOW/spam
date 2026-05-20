import { Box, Card, CardHeader, Chip, MenuProps } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import { BlogItemContent } from "./BlogItemContent";
import { StarCheckbox } from "./StarCheckbox";
import { ShortCheckbox } from "./ShortCheckbox";
import { BlogDto } from "@myorg/shared/dto";
import { StyledIconButton } from "@/components/ui/StyledIconButton";
import { StyledMenu } from "@/components/ui/StyledMenu";
import { StyledMenuItem } from "@/components/ui/StyledMenuItem";
import { StyledListItemIcon } from "@/components/ui/StyledListItemIcon";
import { StyledTooltip } from "@/components/ui/StyledTooltip";
import { StyledTypography } from "@/components/ui/StyledTypography";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/hooks/useConfirm";
import { FULL_PATH_ROUTE } from "@myorg/shared/route";
import { Link } from "@/i18n/navigation";
import {
    useDeleteBlog,
    useSetMainBlog,
    useToggleImportantBlog,
    useToggleShortBlog,
} from "@/hooks/tanstack/useBlogMutations";

const BlogItem = ({ blog }: { blog: BlogDto }) => {
    const t = useTranslations();
    const [anchorEl, setAnchorEl] = useState<MenuProps["anchorEl"] | null>(null);
    const { confirm, confirmDialog } = useConfirm();

    const setMain = useSetMainBlog();
    const toggleImportant = useToggleImportantBlog();
    const toggleShort = useToggleShortBlog();
    const deleteBlog = useDeleteBlog();

    const handleDelete = async () => {
        const ok = await confirm();
        if (!ok) return;
        deleteBlog.mutate(blog.id);
    };

    return (
        <Card
            component="div"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
                overflow: "hidden",
                border: "1px solid",
                borderColor: blog.isMain ? "warning.main" : "divider",
                borderRadius: 2,
            }}
        >
            {confirmDialog}
            <CardHeader
                sx={{
                    bgcolor: blog.isMain
                        ? "rgba(var(--mui-palette-warning-mainChannel) / 0.15)"
                        : "background.paper",
                    p: "6px 10px !important",
                    "& .MuiCardHeader-action": {
                        marginTop: "0px !important",
                        marginBottom: "0px !important",
                    },
                }}
                avatar={
                    <Box display="flex" alignItems="center">
                        {blog.isMain && (
                            <Chip
                                icon={<VerifiedIcon />}
                                label={t("pages.admin.blog.actions.main")}
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                            />
                        )}
                        <StyledTooltip
                            title={t(blog.isImportant
                                ? "pages.admin.blog.actions.toggleImportantActive"
                                : "pages.admin.blog.actions.toggleImportant",
                            )}
                            placement="top"
                        >
                            <span>
                                <StarCheckbox
                                    checked={blog.isImportant}
                                    loading={toggleImportant.isPending}
                                    onClick={() => toggleImportant.mutate(blog.id)}
                                />
                            </span>
                        </StyledTooltip>
                        <StyledTooltip
                            title={t(blog.isShort
                                ? "pages.admin.blog.actions.toggleShortActive"
                                : "pages.admin.blog.actions.toggleShort",
                            )}
                            placement="top"
                        >
                            <span>
                                <ShortCheckbox
                                    checked={blog.isShort}
                                    loading={toggleShort.isPending}
                                    onClick={() => toggleShort.mutate(blog.id)}
                                />
                            </span>
                        </StyledTooltip>
                    </Box>
                }
                action={
                    <StyledIconButton
                        aria-haspopup="true"
                        onClick={(e: SyntheticEvent) => setAnchorEl(e.currentTarget)}
                    >
                        <MoreVertIcon
                            color={blog.isMain ? "warning" : "inherit"}
                            fontSize="medium"
                        />
                    </StyledIconButton>
                }
            />
            <StyledMenu
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorEl={anchorEl}
                sx={{ paddingBottom: 0 }}
            >
                <StyledMenuItem onClick={() => { setAnchorEl(null); setMain.mutate(blog.id); }}>
                    <StyledListItemIcon>
                        <VerifiedIcon color="warning" />
                    </StyledListItemIcon>
                    <StyledTypography color="warning" textTransform="capitalize" textAlign="center">
                        {t(blog.isMain
                            ? "pages.admin.blog.actions.unsetMain"
                            : "pages.admin.blog.actions.setMain",
                        )}
                    </StyledTypography>
                </StyledMenuItem>
                <Link href={FULL_PATH_ROUTE.admin.blog.update.path + "/" + blog.id}>
                    <StyledMenuItem onClick={() => setAnchorEl(null)}>
                        <StyledListItemIcon>
                            <EditIcon />
                        </StyledListItemIcon>
                        {t("common.update")}
                    </StyledMenuItem>
                </Link>
                <StyledMenuItem onClick={() => { setAnchorEl(null); handleDelete(); }}>
                    <StyledListItemIcon>
                        <DeleteForeverIcon color="error" />
                    </StyledListItemIcon>
                    <StyledTypography color="error" textTransform="capitalize" textAlign="center">
                        {t("common.delete")}
                    </StyledTypography>
                </StyledMenuItem>
            </StyledMenu>
            <BlogItemContent blog={blog} />
        </Card>
    );
};

export default BlogItem;
