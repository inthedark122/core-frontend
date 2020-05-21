import {makeStyles} from "@material-ui/core";
import {IEssenceTheme} from "@essence-community/constructor-share/types/Theme";

export const useStyles = makeStyles(
    // eslint-disable-next-line no-unused-vars
    (theme: IEssenceTheme) => ({
        bottomBar: {
            "& .MuiButtonBase-root": {
                boxShadow: "none",
            },
            height: 48,
            overflow: "hidden",
        },
    }),
    {name: "EssenceRoadMapContainer"},
);
