// @flow
import * as React from "react";
import {compose} from "recompose";
import {observer} from "mobx-react";
import noop from "lodash/noop";
import {Paper, Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {withTranslation, WithT} from "@essence-community/constructor-share/utils";
import {mapComponents} from "@essence-community/constructor-share/components";
import {VAR_RECORD_PAGE_OBJECT_ID, VAR_RECORD_DISPLAYED} from "@essence-community/constructor-share/constants";
import cn from "classnames";
import {buttonDirection} from "../../constants";
import commonDecorator from "../../decorators/commonDecorator";
import {PanelFormModel, type PanelFormModelType} from "../../stores/PanelFormModel";
import BuilderForm from "../../Form/BuilderForm";
import withModelDecorator from "../../decorators/withModelDecorator";
import BuilderFilter from "../../Filter/BuilderFilter";
import EmptyTitle from "../../Components/EmptyTitle/EmptyTitle";
import Content from "../../Components/Content/Content";
import {type BuilderPanelPropsType} from "../BuilderPanelType";
import BuilderPanelEditingButtons from "../BuilderPanelEditingButtons/BuilderPanelEditingButtons";
import Panel from "../Panel/Panel";
import styes from "./BuilderFormPanelStyles";

const EMPTY_RECORD = {};
const FITER_ONE_BUTTON = 42;
const FILTER_THREE_BUTTON = 128;

type OwnPropsType = {
    store: PanelFormModelType,
};

type PropsType = BuilderPanelPropsType & OwnPropsType & WithT;

export class BuilderFormPanelBase extends React.Component<PropsType> {
    disposers: Array<Function> = [];

    setRefContent = (node: ?React.ElementRef<*>) => {
        this.props.store.addRefAction("grid-content", node);
    };

    handleChangeCollapse = () => {
        const {store} = this.props;

        store.toggleIsFilterOpen();
    };

    // eslint-disable-next-line max-lines-per-function, max-statements
    render() {
        // eslint-disable-next-line id-length
        const {store, bc, readOnly, hideTitle, pageStore, visible, elevation, t, disabled, classes} = this.props;
        const {filters = [], hideactions} = bc;
        const isHideActions = hideactions === "true";
        const isEditing = readOnly ? false : store.editing;
        const isFilterActionsPresent = filters.length > 0 && filters[0].dynamicfilter !== "true";
        const transCvDisplayed = t(bc[VAR_RECORD_DISPLAYED]);
        const classNameRoot = cn(classes.root, isHideActions ? classes.rootActionsHide : classes.rootActions);
        // eslint-disable-next-line init-declarations
        let paddingTop;

        if (isFilterActionsPresent && pageStore.styleTheme === "dark") {
            paddingTop = store.isFilterOpen ? FILTER_THREE_BUTTON : FITER_ONE_BUTTON;
        }

        const filterComponent = (
            <Grid item>
                {filters.map((filter: Object) => (
                    <BuilderFilter
                        key={filter[VAR_RECORD_PAGE_OBJECT_ID]}
                        onChangeCollapse={this.handleChangeCollapse}
                        open={store.isFilterOpen}
                        disabled={false}
                        bc={filter}
                        parentBc={bc}
                        onSearch={store.searchAction}
                        pageStore={pageStore}
                        handleGlobals={noop}
                        visible={visible}
                        title={hideTitle ? undefined : transCvDisplayed}
                        isHideActions={isHideActions}
                        addRefAction={store.addRefAction}
                        onExited={this.handleUpdateTop}
                        onEntered={this.handleUpdateTop}
                    />
                ))}
            </Grid>
        );

        const actionsComponent = (
            <Grid item style={{paddingTop}} className={classes.formActions}>
                {isEditing ? (
                    <BuilderPanelEditingButtons store={store} bc={bc} pageStore={pageStore} visible={visible} />
                ) : (
                    <Grid container alignItems="center" direction={buttonDirection} spacing={1}>
                        {mapComponents(bc.topbtn, (ChildComp, child) => (
                            <Grid item key={child[VAR_RECORD_PAGE_OBJECT_ID]}>
                                <ChildComp
                                    bc={child}
                                    disabled={disabled}
                                    onlyicon={pageStore.styleTheme === "dark" ? true : undefined}
                                    color="inherit"
                                    pageStore={pageStore}
                                    readOnly={readOnly}
                                    visible={visible}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        );

        const formComponent = (
            <Grid item>
                <BuilderForm
                    initialValues={store.recordsStore.records[0] || EMPTY_RECORD}
                    pageStore={pageStore}
                    isEditing={isEditing}
                    mode={store.mode}
                >
                    <Content verticalSize="16" horizontalSize="16" className={classes.content}>
                        <Panel
                            bc={bc}
                            disabled={disabled}
                            hidden={this.props.hidden}
                            visible={this.props.visible}
                            editing={isEditing}
                            readOnly={readOnly}
                            pageStore={pageStore}
                            tabIndex={this.props.tabIndex}
                            record={this.props.record}
                        />
                    </Content>
                </BuilderForm>
            </Grid>
        );

        const themeContent =
            pageStore.styleTheme === "dark" ? (
                <Grid container direction="row" className={classNameRoot} wrap="nowrap">
                    {isHideActions ? null : actionsComponent}
                    <Grid item container direction="column" className={classes.contentRoot}>
                        <Grid item>{hideTitle ? null : <EmptyTitle title={transCvDisplayed} filters={filters} />}</Grid>
                        {filterComponent}
                        {formComponent}
                    </Grid>
                </Grid>
            ) : (
                <Grid container direction="column" className={classNameRoot} wrap="nowrap">
                    {filterComponent}
                    {isHideActions ? null : actionsComponent}
                    {formComponent}
                </Grid>
            );

        if (elevation) {
            return <Paper elevation={elevation}>{themeContent}</Paper>;
        }

        return themeContent;
    }
}

export default compose(
    commonDecorator,
    withStyles(styes),
    withTranslation("meta"),
    withModelDecorator(
        (bc: $PropertyType<BuilderPanelPropsType, "bc">, {pageStore}: BuilderPanelPropsType): PanelFormModelType =>
            new PanelFormModel({bc, pageStore}),
    ),
    observer,
)(BuilderFormPanelBase);