import {camelCaseMemoized, IBuilderConfig, IClassProps, mapComponents} from "@essence/essence-constructor-share";
import {Badge} from "@material-ui/core";
import {useObserver} from "mobx-react-lite";
import * as React from "react";
import {useStyles} from "./BadgeBtn.styles";

export const BadgeBtn: React.FC<IClassProps> = (props) => {
    const {bc, pageStore, children} = props;
    const classes = useStyles(props);
    const getGlobal = camelCaseMemoized(props.bc.getglobal);

    return useObserver(() => {
        const value = pageStore.globalValues.get(getGlobal);
        const count = parseInt(`${value || "0"}`, 10);

        if (count) {
            return (
                <Badge
                    classes={props.bc.position === "inside" ? classes : undefined}
                    badgeContent={count}
                    color="primary"
                >
                    {children
                        ? children
                        : mapComponents(
                              bc.childs,
                              (Child: React.ComponentType<IClassProps>, childBc: IBuilderConfig) => (
                                  <Child {...props} bc={childBc} key={childBc.ckPageObject} />
                              ),
                          )}
                </Badge>
            );
        }

        return children
            ? children
            : mapComponents(bc.childs, (Child: React.ComponentType<IClassProps>, childBc: IBuilderConfig) => (
                  <Child {...props} bc={childBc} key={childBc.ckPageObject} />
              ));
    });
};
