import React, {Component, Suspense} from "react";
import {CssBaseline} from "@material-ui/core";
import moment from "moment";
import "moment/locale/ru";
import {Tooltip} from "@essence-community/constructor-components";
import {settingsStore, ProjectModel} from "@essence-community/constructor-share/models";
import {ProjectContext} from "@essence-community/constructor-share/context";
import {PageLoader} from "@essence-community/constructor-share/uicomponents";
import {VAR_SETTING_PROJECT_LOADER} from "@essence-community/constructor-share/constants";

import {KeyboardStatusManager} from "./Components/KeyboardStatusManager";
import {Settings} from "./Components/Settings";
import {AppRoutes} from "./AppRoutes";

const projectStore = new ProjectModel();

moment.locale("ru");

class App extends Component {
    render() {
        return (
            <ProjectContext.Provider value={projectStore}>
                <Suspense
                    fallback={
                        <PageLoader
                            container={null}
                            isLoading
                            loaderType={settingsStore.settings[VAR_SETTING_PROJECT_LOADER] as "default" | "bfl-loader"}
                        />
                    }
                >
                    <Settings>
                        <KeyboardStatusManager />
                        <AppRoutes />
                        <CssBaseline />
                        <Tooltip />
                    </Settings>
                </Suspense>
            </ProjectContext.Provider>
        );
    }
}

export default App;
