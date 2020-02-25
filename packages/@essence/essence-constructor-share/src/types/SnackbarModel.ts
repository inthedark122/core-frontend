// eslint-disable-next-line import/named
import {IObservableArray} from "mobx";
import {TFunction} from "i18next";
import {VAR_ERROR_TEXT, VAR_ERROR_ID, VAR_ERROR_CODE} from "../constants/variables";
import {IResponse, FieldValue, IRecordsModel, IProgressModel, IApplicationModel, IRouteRecord} from ".";

export type SnackbarStatus =
    | "all"
    | "warning"
    | "error"
    | "info"
    | "notification"
    | "debug"
    | "progress"
    | "block"
    | "unblock"
    | "uploaded"
    | "errorUpload";

export interface ISnackbar {
    autoHidden: boolean;
    text: string | JSX.Element | ((trans: TFunction) => string | JSX.Element);
    status: SnackbarStatus;
    id: string;
    createdAt: string;
    hiddenTimeout: number;
    pageName: string;
    open: boolean;
    read: boolean;
    progressStore?: IProgressModel;
    type: "msg" | "progress";
    title?: string | ((trans: TFunction) => string);
    description?: string;
    code?: string;
}

export interface IErrorData {
    [VAR_ERROR_ID]: string;
    [VAR_ERROR_TEXT]: string;
    [VAR_ERROR_CODE]: string;
    query: string;
}

export interface ISnackbarModel {
    snackbars: IObservableArray<ISnackbar>;
    snackbarsAll: ISnackbar[];
    recordsStore: IRecordsModel;
    snackbarsCount: number;
    activeStatus: SnackbarStatus;
    snackbarsInStatus: ISnackbar[];
    snackbarsInStatusToReadCount: number;
    deleteAllSnackbarAction: () => void;
    readSnackbarAction: (snackbarId: string) => void;
    readActiveSnackbarsAction: () => void;
    setStatusAction: (status: SnackbarStatus) => void;
    deleteSnackbarAction: (snackbarId: string) => void;
    snackbarOpenAction: (snakebar: ISnackbar) => void;
    setClosebleAction: (snackbarId: string) => void;
    snackbarCloseAction: (snackbarId: string) => void;
    checkValidResponseAction: (
        response: IResponse,
        route?: Record<string, FieldValue>,
        warnCallBack?: Function,
        applicationStore?: IApplicationModel | null,
    ) => number;
    checkValidLoginResponse: (response: Record<string, FieldValue>) => boolean;
    checkExceptResponse: (
        error: Record<string, any>,
        route?: IRouteRecord,
        applicationStore?: IApplicationModel,
    ) => boolean;
}
