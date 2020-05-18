import {action, observable, computed} from "mobx";
import {removeFromStore, print, findSetKey, isEmpty, saveToStore} from "@essence-community/constructor-share/utils";
import {snackbarStore, StoreBaseModel} from "@essence-community/constructor-share/models";
import {
    VAR_RECORD_PARENT_ID,
    VAR_RECORD_MASTER_ID,
    VAR_RECORD_PAGE_OBJECT_ID,
    VAR_RECORD_ROUTE_PAGE_ID,
} from "@essence-community/constructor-share/constants";
import {
    IRecord,
    FieldValue,
    IBuilderMode,
    IBuilderConfig,
    IHandlerOptions,
    IStoreBaseModelProps,
    IRecordsSearchOptions,
} from "@essence-community/constructor-share/types";
import {attachGlobalValues} from "@essence-community/constructor-share/actions/saveAction";

export class FilterModel extends StoreBaseModel {
    public valuesStorageKey = "";

    @observable public isOpen = false;

    @observable public values = {};

    @computed public get selectedRecord() {
        return this.values;
    }

    constructor(props: IStoreBaseModelProps) {
        super(props);

        if (this.bc.filtervaluessave === "true" && this.pageStore.pageId) {
            this.valuesStorageKey = `${this.pageStore.pageId}_filter_${this.bc[VAR_RECORD_PAGE_OBJECT_ID]}`;
        }

        this.isOpen = this.bc.collapsed !== "true";
    }

    @action
    setValues = (values: IRecord): void => {
        const filterValues = {...values};

        if (isEmpty(filterValues[this.recordId]) && this.bc.childs) {
            for (const child of this.bc.childs) {
                if (child.required === "true" && child.column) {
                    filterValues[this.recordId] = filterValues[child.column];
                    break;
                }
            }
        }
        if (this.valuesStorageKey) {
            saveToStore(this.valuesStorageKey, filterValues);
        }
        this.values = filterValues;
    };

    resetValues = () => {
        this.values = {};

        if (this.valuesStorageKey) {
            removeFromStore(this.valuesStorageKey);
        }
    };

    handlePrint = async (isOnline: boolean, bcBtn: IBuilderConfig): Promise<boolean> => {
        const form = this.pageStore.forms.get(this.bc[VAR_RECORD_PAGE_OBJECT_ID]);

        if (form) {
            form.validate();

            const values = form.isValid ? form.values : undefined;

            if (values) {
                const isValidPrint = await print({
                    applicationStore: this.pageStore.applicationStore,
                    bc: this.bc,
                    bcBtn,
                    isOnline,
                    pageStore: this.pageStore,
                    reloadPageObject: {
                        [VAR_RECORD_PAGE_OBJECT_ID]: this.bc[VAR_RECORD_MASTER_ID] || this.bc[VAR_RECORD_PARENT_ID],
                        [VAR_RECORD_ROUTE_PAGE_ID]: this.pageStore.pageId,
                    },
                    snackbarStore,
                    timeout: bcBtn.timeout || this.bc.timeout,
                    values: attachGlobalValues({
                        getglobaltostore: bcBtn.getglobaltostore,
                        globalValues: this.pageStore.globalValues,
                        values,
                    }),
                });

                if (isValidPrint) {
                    form.submit();
                }
            }
        }

        return Promise.resolve(true);
    };

    handleGlobals = (values: IRecord) => {
        const {setglobal} = this.bc;

        if (setglobal) {
            const globalValues: Record<string, FieldValue> = {};
            const keys = findSetKey(setglobal);

            for (const fieldName in keys) {
                if (Object.prototype.hasOwnProperty.call(keys, fieldName)) {
                    globalValues[keys[fieldName]] = values[fieldName];
                }
            }

            this.pageStore.updateGlobalValues(globalValues);
        }
    };

    @action
    handleSubmit = async (values: IRecord, options?: IRecordsSearchOptions) => {
        const parentStore = this.pageStore.stores.get(this.bc[VAR_RECORD_PARENT_ID]);

        this.setValues(values);

        if (parentStore && parentStore.recordsStore) {
            await parentStore.recordsStore.searchAction(this.values, options);
        }
    };

    @action
    handleAutoload = async () => {
        const form = this.pageStore.forms.get(this.bc[VAR_RECORD_PAGE_OBJECT_ID]);
        const parentStore = this.pageStore.stores.get(this.bc[VAR_RECORD_PARENT_ID]);

        if (form && parentStore) {
            await form.validate();

            if (form.isValid) {
                this.handleSubmit(form.values);
            }
        }
    };

    handlers = {
        onFilterToggle: () => {
            this.isOpen = !this.isOpen;

            return Promise.resolve(true);
        },

        /**
         * Offline print. Result will be after delay.
         * Should be WebSocket notifictio after complete
         */
        onPrintHandleOffline: (mode: IBuilderMode, btnBc: IBuilderConfig) => this.handlePrint(false, btnBc),
        /**
         * Offline Print
         */
        onPrintHandleOnline: (mode: IBuilderMode, btnBc: IBuilderConfig) => this.handlePrint(true, btnBc),
        onReset: (mode: IBuilderMode, btnBc: IBuilderConfig, options: IHandlerOptions) => {
            const {form} = options;

            if (form) {
                form.reset();
            }

            this.resetValues();

            return Promise.resolve(true);
        },
    };
}