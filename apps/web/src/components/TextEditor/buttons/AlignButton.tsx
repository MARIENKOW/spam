import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import { useTiptap, useTiptapState } from "@tiptap/react";
import { StyledIconButton } from "@/components/ui/StyledIconButton";

type Alignment = "left" | "center" | "right";

const ICONS: Record<Alignment, typeof FormatAlignLeftIcon> = {
    left: FormatAlignLeftIcon,
    center: FormatAlignCenterIcon,
    right: FormatAlignRightIcon,
};

interface Props {
    align: Alignment;
}

export default function AlignButton({ align }: Props) {
    const { editor } = useTiptap();
    const isActive = useTiptapState((ctx) =>
        ctx.editor.isActive({ textAlign: align }),
    );
    const Icon = ICONS[align];

    return (
        <StyledIconButton
            color={isActive ? "primary" : "default"}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
        >
            <Icon />
        </StyledIconButton>
    );
}
