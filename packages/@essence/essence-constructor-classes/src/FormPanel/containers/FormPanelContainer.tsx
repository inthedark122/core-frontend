import * as React from "react";
import {mapComponentOne} from "@essence-community/constructor-share/components";
import {IClassProps, IBuilderConfig, FieldValue} from "@essence-community/constructor-share/types";
import {UIForm} from "@essence-community/constructor-share/uicomponents/UIForm";
import {useModel} from "@essence-community/constructor-share/hooks/useModel";
import {useObserver} from "mobx-react-lite";
import {IRecord} from "@essence-community/constructor-share//types/Base";
import {findSetKey} from "@essence-community/constructor-share/utils/findKey";
import {reaction} from "mobx";
import {findGetGlobalKey, isEmpty} from "@essence-community/constructor-share/utils";
import {FormPanelModel} from "../store/FormPanelModel";
import {useStyles} from "./FormPanelContainer.styles";

export const FormPanelContainer: React.FC<IClassProps> = (props) => {
    const {children, bc, pageStore} = props;
    const {setglobal, getglobal} = bc;
    const classes = useStyles();
    const boxBc = React.useMemo(() => ({...bc, type: "BOX.NOCOMMONDECORATOR"} as IBuilderConfig), [bc]);
    const [store] = useModel((options) => new FormPanelModel(options), props);

    const handleSetGlobal = React.useCallback(
        (values: IRecord) => {
            if (setglobal) {
                const globalValues: Record<string, FieldValue> = {};
                const keys = findSetKey(setglobal);

                Object.entries(keys).forEach(([fieldName, globaleKey]) => {
                    globalValues[globaleKey] = values[fieldName];
                });

                pageStore.updateGlobalValues(globalValues);
            }
        },
        [pageStore, setglobal],
    );

    React.useEffect(() => {
        if (getglobal) {
            const keys = findGetGlobalKey(getglobal);

            return reaction(
                () => {
                    const globalValues: Record<string, FieldValue> = {};

                    Object.entries(keys).forEach(([fieldName, globaleKey]) => {
                        const value = pageStore.globalValues.get(globaleKey);

                        if (!isEmpty(value)) {
                            globalValues[
                                fieldName === globaleKey ? store.recordsStore.recordId : fieldName
                            ] = pageStore.globalValues.get(globaleKey);
                        }
                    });

                    return globalValues;
                },
                (globalValues) => {
                    // eslint-disable-next-line init-declarations
                    let record: IRecord | undefined;

                    if (Object.prototype.hasOwnProperty.call(globalValues, store.recordsStore.recordId)) {
                        record = store.recordsStore.records.find(
                            // eslint-disable-next-line eqeqeq
                            (rec) => rec[store.recordsStore.recordId] == globalValues[store.recordsStore.recordId],
                        );
                    } else {
                        const nameFields = Object.keys(globalValues);

                        record = store.recordsStore.records.find(
                            // eslint-disable-next-line eqeqeq
                            (rec) => nameFields.filter((key) => !(rec[key] == globalValues[key])).length === 0,
                        );
                    }

                    if (record) {
                        store.recordsStore.setSelectionAction(record[store.recordsStore.recordId]);
                    }
                },
            );
        }

        return undefined;
    }, [bc, pageStore, getglobal, store]);

    return useObserver(() => (
        <UIForm
            onSubmit={handleSetGlobal}
            submitOnChange
            className={classes.form}
            bc={bc}
            mode={store.mode}
            editing={store.editing}
            initialValues={store.selectedRecord || {}}
            pageStore={pageStore}
        >
            {children
                ? children
                : mapComponentOne(boxBc, (Child, childBc) => (
                      <Child key={childBc.ck_page_object} {...props} bc={childBc} />
                  ))}
        </UIForm>
    ));
};
