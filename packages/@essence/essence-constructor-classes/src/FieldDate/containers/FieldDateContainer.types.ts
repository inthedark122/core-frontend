import {makeStyles} from "@material-ui/core";
import {IEssenceTheme} from "@essence-community/constructor-share/types/Theme";

export const useStyles = makeStyles(
    (theme: IEssenceTheme) => ({
        "@global": {
            ".rc-calendar": {
                overflow: "hidden",
            },
            ".rc-calendar-date": {
                borderRadius: "50%",
            },
            [".rc-calendar-header, .rc-calendar-month-panel-header," +
            " .rc-calendar-year-panel-header, .rc-calendar-decade-panel-header"]: {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
            },
            [".rc-calendar-month-panel-prev-year-btn, .rc-calendar-month-panel-year-select-content," +
            " .rc-calendar-month-panel-next-year-btn"]: {
                color: theme.palette.common.white,
            },
            [".rc-calendar-month-select, .rc-calendar-next-month-btn, .rc-calendar-next-year-btn," +
            " .rc-calendar-prev-month-btn, .rc-calendar-prev-year-btn, .rc-calendar-year-select," +
            " .rc-calendar-day-select"]: {
                color: theme.palette.common.white,
            },
            ".rc-calendar-picker": {
                zIndex: theme.zIndex.modal,
            },
            ".rc-calendar-selected-date .rc-calendar-date": {
                background: theme.essence.palette.icon.primary,
                color: theme.palette.common.white,
            },
            ".rc-calendar-today .rc-calendar-date": {
                borderColor: theme.palette.secondary.main,
            },
        },
        "format-4": {
            "@global": {
                ".rc-time-picker-panel-combobox": {
                    "& div:nth-child(2)": {
                        color: theme.essence.palette.grey.disable,
                        pointerEvents: "none",
                    },
                    "& div:nth-child(3)": {
                        color: theme.essence.palette.grey.disable,
                        pointerEvents: "none",
                    },
                },
            },
        },
        rootIcon: {
            height: theme.essence.sizing.gridRowHeight,
            width: theme.essence.sizing.gridRowHeight,
        },
    }),
    {name: "EssenceFieldDateContainer"},
);
