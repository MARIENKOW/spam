import { IconButton, CircularProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import TurnedInIcon from "@mui/icons-material/TurnedIn";

export const ShortCheckbox = ({ checked, onClick, loading }) => {
    if (loading) return <CircularProgress size={20} />;
    return (
        <IconButton onClick={onClick}>
            {checked
                ? <TurnedInIcon fontSize="medium" color="info" />
                : <TurnedInNotIcon fontSize="medium" htmlColor={grey[700]} />
            }
        </IconButton>
    );
};
