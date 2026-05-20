import { IconButton, CircularProgress } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { grey } from "@mui/material/colors";

export const StarCheckbox = ({ checked, onClick, loading }) => {
    if (loading) return <CircularProgress size={20} />;
    return (
        <IconButton onClick={onClick}>
            <StarIcon fontSize="medium" color={checked ? "warning" : undefined} htmlColor={checked ? undefined : grey[700]} />
        </IconButton>
    );
};
