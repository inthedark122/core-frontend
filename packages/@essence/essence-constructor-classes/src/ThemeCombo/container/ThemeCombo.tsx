import {IClassProps} from "@essence-community/constructor-share";
import {settingsStore} from "@essence-community/constructor-share/models";
import {saveToStore, getFromStore} from "@essence-community/constructor-share/utils";
import {
    VAR_RECORD_PARENT_ID,
    VAR_RECORD_PAGE_OBJECT_ID,
    VAR_RECORD_OBJECT_ID,
    VAR_RECORD_QUERY_ID,
    VAR_RECORD_DISPLAYED,
} from "@essence-community/constructor-share/constants/variables";
import * as React from "react";
import {useDisposable} from "mobx-react-lite";
import {getComponent} from "@essence-community/constructor-share/components";
import {IBuilderConfig} from "@essence-community/constructor-share/types";
import {reaction} from "mobx";

const GLOBAL_VALUE = "g_sys_theme";
const getComponentBc = (bc: IBuilderConfig, defaultTheme?: string) => ({
    [VAR_RECORD_DISPLAYED]: "static:0b5e4673fa194e16a0c411ff471d21d2",
    [VAR_RECORD_OBJECT_ID]: bc[VAR_RECORD_OBJECT_ID],
    [VAR_RECORD_PAGE_OBJECT_ID]: bc[VAR_RECORD_PAGE_OBJECT_ID],
    [VAR_RECORD_PARENT_ID]: bc[VAR_RECORD_PARENT_ID],
    [VAR_RECORD_QUERY_ID]: bc[VAR_RECORD_QUERY_ID],
    clearable: "false",
    column: bc.column || "theme",
    datatype: "COMBO",
    defaultvalue: defaultTheme,
    displayfield: bc.displayfield || "name",
    getglobal: GLOBAL_VALUE,
    localization: "meta",
    noglobalmask: "true",
    querymode: "remote",
    records: [
        {name: "static:66ef0068472a4a0394710177f828a9b1", value: "dark"},
        {name: "static:fd7c7f3539954cc8a55876e3514906b5", value: "light"},
    ],
    setglobal: GLOBAL_VALUE,
    type: "IFIELD",
    valuefield: bc.valuefield || "value",
});

interface IComboClassProps extends IClassProps {
    editing?: boolean;
}

export const ThemeCombo: React.FC<IClassProps> = (props) => {
    const themeGlobal = settingsStore.settings[GLOBAL_VALUE];
    let currentTheme = getFromStore("theme", themeGlobal);

    if (themeGlobal !== currentTheme) {
        props.pageStore.updateGlobalValues({
            [GLOBAL_VALUE]: currentTheme,
        });
    }
    const bc = React.useMemo(() => getComponentBc(props.bc, currentTheme), [props.bc, currentTheme]);

    useDisposable(() => {
        return reaction(
            () => props.pageStore.globalValues.get(bc.setglobal),
            (theme: string) => {
                if (theme && currentTheme !== theme) {
                    saveToStore("theme", theme);
                    currentTheme = theme;
                    document.location.reload();
                } else if (!theme) {
                    props.pageStore.updateGlobalValues({
                        [bc.getglobal]: currentTheme,
                    });
                }
            },
        );
    });
    const Comp: React.ComponentType<IComboClassProps> | null = getComponent(bc.type);

    if (!Comp) {
        return null;
    }

    return <Comp {...props} bc={bc} editing />;
};
