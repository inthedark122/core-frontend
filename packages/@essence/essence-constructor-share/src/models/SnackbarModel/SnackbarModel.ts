/* eslint-disable max-lines */
// eslint-disable-next-line import/named
import {extendObservable, action, IObservableArray} from "mobx";
import uuidv4 from "uuid/v4";
import {isObject, forEach, get} from "lodash";
import {
    IBuilderConfig,
    IRecord,
    IApplicationModel,
    FieldValue,
    IResponse,
    ISnackbarModel,
    ISnackbar,
    SnackbarStatus,
    IErrorData,
} from "../../types";
import {RecordsModel} from "../RecordsModel";
import {isEmpty, i18next} from "../../utils";
import {
    VAR_RECORD_ROUTE_NAME,
    VAR_RECORD_RES_ERROR,
    VAR_RECORD_RES_STACK_TRACE,
    VAR_RECORD_ID,
    VAR_RECORD_PARENT_ID,
    VAR_RECORD_PAGE_OBJECT_ID,
    VAR_RECORD_QUERY_ID,
    VAR_RECORD_CV_TEXT,
    VAR_RECORD_CR_TYPE,
    VAR_RECORD_CV_RESULT,
} from "../../constants";
import {IRouteRecord} from "../../types/RoutesModel";
import {MAX_OPENED_SNACKBARS, CODE_ACCESS_DENIEND, GROUP_ACTION_MAP, CODE_GROUP_MAP} from "./SnackbarModel.contants";

/**
 * @class SnackbarModel
 *
 * Класс является signleton и может экспортироваться как snackbarStore.
 * Использование происходит на всех приложениях и служить для вывода нотификаций между приложениями.
 * Для создания нотификации для отдельного приложения можно создавать отдельные экзепляры класса.
 */
export class SnackbarModel implements ISnackbarModel {
    snackbars: IObservableArray<ISnackbar>;

    snackbarsAll: Array<ISnackbar>;

    recordsStore: RecordsModel;

    activeStatus: SnackbarStatus;

    snackbarsInStatus: Array<ISnackbar>;

    snackbarsCount: number;

    snackbarsInStatusToReadCount: number;

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const mod = require("../RecordsModel/RecordsModel");
        const bc: IBuilderConfig = {
            [VAR_RECORD_PAGE_OBJECT_ID]: "Snackbar",
            [VAR_RECORD_PARENT_ID]: "root",
            [VAR_RECORD_QUERY_ID]: "GetMsgList",
        };

        this.recordsStore = new mod.RecordsModel(bc);

        extendObservable(this, {
            activeStatus: "all",
            snackbars: [],
            snackbarsAll: [],
            get snackbarsCount() {
                return this.snackbarsAll.filter(
                    (snackbar: ISnackbar) => snackbar.status !== "debug" && snackbar.read === false,
                ).length;
            },
            get snackbarsInStatus() {
                if (this.activeStatus === "all") {
                    return this.snackbarsAll.filter((snackbar: ISnackbar) => snackbar.status !== "debug");
                } else if (this.activeStatus === "notification") {
                    return this.snackbarsAll.filter(
                        (snackbar: ISnackbar) =>
                            snackbar.pageName === i18next.t("static:2ff612aa52314ddea65a5d303c867eb8") ||
                            snackbar.status === this.activeStatus,
                    );
                }

                return this.snackbarsAll.filter((snackbar: ISnackbar) => snackbar.status === this.activeStatus);
            },
            get snackbarsInStatusToReadCount() {
                return this.snackbarsInStatus.filter((snackbar: ISnackbar) => snackbar.read === false).length;
            },
        });
    }

    deleteAllSnackbarAction = action("deleteAllSnackbarAction", () => {
        if (this.activeStatus === "all") {
            this.snackbarsAll = this.snackbarsAll.filter((snackbar) => snackbar.status === "debug");
        } else if (this.activeStatus === "notification") {
            this.snackbarsAll = this.snackbarsAll.filter(
                (snackbar) =>
                    snackbar.pageName !== i18next.t("static:2ff612aa52314ddea65a5d303c867eb8") &&
                    snackbar.status !== this.activeStatus,
            );
        } else {
            this.snackbarsAll = this.snackbarsAll.filter((snackbar) => snackbar.status !== this.activeStatus);
        }
    });

    deleteSnackbarAction = action("deleteSnackbarAction", (snackbarId: string) => {
        this.snackbarsAll = this.snackbarsAll.filter((snakebar) => snakebar.id !== snackbarId);
    });

    readSnackbarAction = action("readSnackbarAction", (snackbarId: string) => {
        const snackbar = this.snackbarsAll.find((snack) => snack.id === snackbarId);

        if (snackbar) {
            snackbar.read = true;
        }
    });

    readActiveSnackbarsAction = action("readActiveSnackbarsAction", () => {
        this.snackbarsInStatus.forEach((snackbar) => {
            if (snackbar.read === false) {
                snackbar.read = true;
            }
        });
    });

    setStatusAction = action("setStatusAction", (status: SnackbarStatus) => {
        this.activeStatus = status;
    });

    snackbarOpenAction = action("snackbarOpenAction", (snackbar: Partial<ISnackbar>, route?: IRouteRecord) => {
        const routeName = route && route[VAR_RECORD_ROUTE_NAME];
        const {id, ...snackbarData} = snackbar;
        const date = new Date();
        const snackbarProps: ISnackbar = {
            autoHidden: true,
            // TODO: should be format "DD.MM.YYYY, HH:mm";
            createdAt: date.toLocaleString(),
            hiddenTimeout: 5000,
            id: id || uuidv4(),
            open: true,
            pageName: typeof routeName === "string" ? routeName : "",
            read: false,
            status: "all",
            text: "",
            type: "msg",
            ...snackbarData,
        };

        if (snackbar.hiddenTimeout !== 0) {
            const openedSnackbars = this.snackbars.filter((snack) => snack.open !== false);

            if (openedSnackbars.length >= MAX_OPENED_SNACKBARS) {
                openedSnackbars[openedSnackbars.length - 1].open = false;
            }

            this.snackbars.unshift(snackbarProps);
        }

        this.snackbarsAll.unshift(snackbarProps);
    });

    setClosebleAction = action("setClosebleAction", (snackbarId: string) => {
        const closableSnackbar = this.snackbars.find((snakebar) => snakebar.id === snackbarId);

        if (closableSnackbar) {
            closableSnackbar.open = false;
        }
    });

    snackbarCloseAction = action("snackbarCloseAction", (snackbarId: string) => {
        const removedSnackbar = this.snackbars.find((snakebar) => snakebar.id === snackbarId);

        if (removedSnackbar) {
            this.snackbars.remove(removedSnackbar);
        }
    });

    // eslint-disable-next-line max-statements
    checkValidResponseAction = action(
        "checkValidResponseAction",
        (
            // eslint-disable-next-line default-param-last
            response: IResponse = {},
            route?: Record<string, FieldValue>,
            warnCallBack?: Function,
            applicationStore?: IApplicationModel | null,
            // eslint-disable-next-line max-params
        ) => {
            const error = response[VAR_RECORD_RES_ERROR];
            let isError = false;
            let isWarn = false;
            let rec: boolean | IRecord | undefined = false;
            let warningText = "";

            if (isEmpty(error)) {
                return 1;
            }

            if (isObject(error)) {
                const stackTrace = response[VAR_RECORD_RES_STACK_TRACE];

                forEach(error, (values: string[], code) => {
                    rec =
                        code === "block" || code === "unblock"
                            ? {
                                  [VAR_RECORD_CR_TYPE]: code,
                                  [VAR_RECORD_CV_TEXT]: "{0}",
                              }
                            : this.recordsStore.recordsState.records.find(
                                  (record: IRecord) => String(record[VAR_RECORD_ID]) === code,
                              );

                    if (code === CODE_ACCESS_DENIEND && applicationStore && route) {
                        const routeId = route[VAR_RECORD_ID];

                        if (typeof routeId === "string") {
                            applicationStore.pagesStore.removePageAction(routeId);
                        }
                    }
                    if (rec) {
                        const {[VAR_RECORD_CV_TEXT]: message = ""} = rec;
                        const messageType = rec[VAR_RECORD_CR_TYPE];
                        const text =
                            typeof message === "string"
                                ? i18next
                                      .t(message, message, {ns: "message"})
                                      // eslint-disable-next-line require-unicode-regexp, prefer-named-capture-group
                                      .replace(/{(\d+)}/g, (match, pattern) =>
                                          i18next.t((values && values[pattern]) || "", "", {ns: "message"}),
                                      )
                                : "";

                        if (messageType === "error") {
                            isError = true;
                        }
                        if (warnCallBack && rec[VAR_RECORD_CR_TYPE] === "warning") {
                            isWarn = true;
                            warningText = `${warningText}${text}\r\n`;
                        }

                        if ((messageType === "block" || messageType === "unblock") && applicationStore) {
                            applicationStore.blockApplicationAction(messageType, text);
                        }
                        this.snackbarOpenAction(
                            {
                                status: String(messageType) as SnackbarStatus,
                                text,
                            },
                            route,
                        );
                    }
                });

                if (stackTrace) {
                    this.snackbarOpenAction(
                        {
                            status: "debug",
                            text: stackTrace,
                        },
                        route,
                    );
                }
            }
            if (!isError && isWarn && warnCallBack) {
                warnCallBack(`${warningText.trim()}`);

                return 2;
            }

            return isError ? 0 : 1;
        },
    );

    snackbarChangeStatusAction = action("snackbarChangeStatusAction", (snackbarId: string, status: SnackbarStatus) => {
        const changedSnakebar = this.snackbars.find((snakebar) => snakebar.id === snackbarId);
        const changedSnakebarAll = this.snackbarsAll.find((snakebar) => snakebar.id === snackbarId);

        if (changedSnakebar) {
            changedSnakebar.status = status;
        }

        if (changedSnakebarAll) {
            changedSnakebarAll.status = status;
        }
    });

    checkValidLoginResponse = action("checkValidLoginResponse", (response: Record<string, FieldValue>) => {
        if (isEmpty(response.session)) {
            this.snackbarOpenAction({status: "warning", text: String(response[VAR_RECORD_CV_RESULT])});

            return false;
        }

        return true;
    });

    checkExceptResponse = action(
        "checkExceptResponse",
        (error: Record<string, any>, route?: IRouteRecord, applicationStore?: IApplicationModel | null) => {
            const responseError = error.responseError || {};
            const errCode = responseError.errCode as keyof typeof CODE_GROUP_MAP;
            const groupCode = CODE_GROUP_MAP[errCode] as keyof typeof GROUP_ACTION_MAP;
            const functionName = `${get(GROUP_ACTION_MAP[groupCode], "TEST", "error")}Action`;
            // @ts-ignore
            const callback = this[functionName];

            if (callback) {
                return callback({...responseError, query: error.query}, route, applicationStore);
            }

            return false;
        },
    );

    errorResponseAction = action("errorResponseAction", (errorData: IErrorData, route?: IRouteRecord) => {
        this.snackbarOpenAction(
            {
                status: "error",
                text: errorData && errorData.errText ? errorData.errText : "",
                title: i18next.t("static:515a199e09914e3287afd9c95938f3a7", errorData.query),
            },
            route,
        );
    });

    errorDetailsAction = action("errorDetailsAction", (errorData: IErrorData, route?: IRouteRecord) => {
        this.snackbarOpenAction(
            {
                code: errorData.errCode || errorData.errId,
                description: errorData.errText,
                status: "error",
                title: i18next.t("static:4fdb3577f24440ceb8c717adf68bac48", errorData),
            },
            route,
        );
    });

    errorMaskAction = action("errorMaskAction", (errorData: IErrorData, route?: IRouteRecord) => {
        this.snackbarOpenAction(
            {
                description: errorData.errId,
                status: "error",
                title: i18next.t("static:515a199e09914e3287afd9c95938f3a7", errorData),
            },
            route,
        );
    });

    errorAction = action("errorAction", (_error: Error, route?: IRouteRecord) => {
        this.snackbarOpenAction(
            {
                status: "error",
                text: i18next.t("static:2d209550310a4fae90389134a5b12353"),
            },
            route,
        );
    });

    errorRemoteAuthAction = action("errorRemoteAuthAction", (_error: Error, route?: IRouteRecord) => {
        this.snackbarOpenAction(
            {
                status: "error",
                text: i18next.t("static:23cd49d589b74476acaa0b347b207d00"),
            },
            route,
        );
    });

    accessDeniedAction = action(
        "accessDeniedAction",
        (_error: Error, route?: Record<string, FieldValue>, applicationStore?: IApplicationModel) => {
            this.snackbarOpenAction(
                {status: "error", title: i18next.t("static:1d5ca35298f346cab823812e2b57e15a")},
                route,
            );
            const recordId = route ? route[VAR_RECORD_ID] : undefined;

            if (applicationStore && typeof recordId === "string") {
                applicationStore.pagesStore.removePageAction(recordId);
            }
        },
    );

    invalidSessionAction = action(
        "invalidSessionAction",
        (_error: Error, route?: IRouteRecord, applicationStore?: IApplicationModel) => {
            this.snackbarOpenAction(
                {status: "error", title: i18next.t("static:5bf781f61f9c44b8b23c76aec75e5d10")},
                route,
            );

            if (applicationStore) {
                applicationStore.logoutAction();
            }
        },
    );

    loginFailedAction = action("loginFailedAction", (_error: Error, route?: IRouteRecord) => {
        this.snackbarOpenAction({status: "error", title: i18next.t("static:b5a60b8ff5cd419ebe487a68215f4490")}, route);
    });
}
