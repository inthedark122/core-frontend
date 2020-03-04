// @flow
import * as React from "react";
import {initI18n, WithT, withTranslation} from "@essence-community/constructor-share/utils";
import {settingsStore} from "@essence-community/constructor-share/models/SettingsModel";
import {
    VAR_RECORD_ID,
    VAR_RECORD_CV_VALUE,
    VAR_SETTING_PROJECT_NAME,
    VAR_SETTING_FRONT_APP_VERSION,
    VAR_SETTING_FRONT_BRANCH_DATE_TIME,
    VAR_SETTING_FRONT_BRANCH_NAME,
    VAR_SETTING_FRONT_COMMIT_ID,
} from "@essence-community/constructor-share/constants";
import {observer} from "mobx-react";
import {COMMIT_ID, BRANCH_DATE_TIME, BRANCH_NAME} from "../../constants";
import {type ApplicationModelType} from "../../Stores/ApplicationModel";
import {history} from "../../history";

type PropsType = WithT & {
    children: React.Node,
    applicationStore: ApplicationModelType,
};

class Settings extends React.Component<PropsType> {
    // eslint-disable-next-line max-lines-per-function,max-statements
    componentDidMount() {
        const {applicationStore} = this.props;

        const setting = [
            ...window.SETTINGS,
            {
                [VAR_RECORD_CV_VALUE]: this.props.t("static:26686005b3584a12aeb9ca9e96e54753", {
                    BRANCH_DATE_TIME,
                    BRANCH_NAME,
                    COMMIT_ID,
                }),
                [VAR_RECORD_ID]: VAR_SETTING_FRONT_APP_VERSION,
            },
            {
                [VAR_RECORD_CV_VALUE]: BRANCH_DATE_TIME,
                [VAR_RECORD_ID]: VAR_SETTING_FRONT_BRANCH_DATE_TIME,
            },
            {
                [VAR_RECORD_CV_VALUE]: BRANCH_NAME,
                [VAR_RECORD_ID]: VAR_SETTING_FRONT_BRANCH_NAME,
            },
            {
                [VAR_RECORD_CV_VALUE]: COMMIT_ID,
                [VAR_RECORD_ID]: VAR_SETTING_FRONT_COMMIT_ID,
            },
        ];

        applicationStore.settingsStore.recordsStore.setRecordsAction(setting);

        settingsStore.setSettings(setting);

        initI18n();

        const {settings} = applicationStore.settingsStore;

        const globalSettings = Object.keys(settings).reduce((acc, settingKey) => {
            if (settingKey.indexOf("g") === 0) {
                acc[settingKey] = settings[settingKey];
            }

            return acc;
        }, {});

        applicationStore.updateGlobalValuesAction(globalSettings);

        if (applicationStore.settingsStore.settings[VAR_SETTING_PROJECT_NAME]) {
            document.title = applicationStore.settingsStore.settings[VAR_SETTING_PROJECT_NAME];
        }
        applicationStore.authStore.checkAuthAction(history);
    }

    render() {
        if (this.props.applicationStore.settingsStore.recordsStore.records.length === 0) {
            return this.props.t("static:8aebd9c71dda43fc8583d96f1d4d0d01");
        }

        return this.props.children;
    }
}

export default withTranslation("meta")(observer(Settings));
