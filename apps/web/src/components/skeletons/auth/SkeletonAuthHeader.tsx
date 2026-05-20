import { StyledSkeleton } from "@/components/ui/StyledSkeleton";
import AuthErrorWrapper from "@/components/wrappers/feedback/AuthErrorWrapper";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function SkeletonAuthHeader() {
    return (
        <AuthErrorWrapper>
            <StyledSkeleton variant="rounded" width={60} height={30} />
            <WarningAmberIcon
                color="error"
                sx={{
                    zIndex: 2,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                }}
            />
        </AuthErrorWrapper>
    );
}
