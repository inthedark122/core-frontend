import * as React from "react";
import {IClassProps} from "@essence-community/constructor-share/types";
import {ApplicationContext} from "@essence-community/constructor-share/context";
import {VAR_RECORD_CV_TOKEN} from "@essence-community/constructor-share/constants";
import {useHistory, useParams} from "react-router-dom";

export const StaticFrameContainer: React.FC<IClassProps> = () => {
    const applicationStore = React.useContext(ApplicationContext);
    const history = useHistory();
    const {session, token = "", app, pageId, filter} = useParams();

    React.useEffect(() => {
        history.replace(history.location.pathname, {backUrl: `/${app}/${pageId}${filter ? `/${filter}` : ""}`});
        const loginByToken = async () => {
            await applicationStore?.authStore.loginAction(
                {
                    [VAR_RECORD_CV_TOKEN]: token,
                },
                history,
            );

            // If not logger change bach url to page instead of return to back frame page
            if (!applicationStore?.authStore.userInfo.session) {
                history.replace(history.location.pathname, {backUrl: `/${app}/${pageId}${filter ? `/${filter}` : ""}`});
            }
        };
        const loginBySesstion = async () => {
            await applicationStore?.authStore.checkAuthAction(history, session);
            // If not session go to auth page
            if (!applicationStore?.authStore.userInfo.session) {
                history.replace("/auth", {backUrl: `/${app}/${pageId}${filter ? `/${filter}` : ""}`});
            }
        };

        if (session) {
            loginBySesstion();
        } else if (token) {
            loginByToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};
