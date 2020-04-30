import * as React from "react";
import {IClassProps} from "@essence-community/constructor-share/types";
import {RecordContext} from "@essence-community/constructor-share/context";
import {VAR_RECORD_LEAF} from "@essence-community/constructor-share/constants";
import {Translation} from "@essence-community/constructor-share/utils";
import {ColumnTreeSchevron} from "../components/ColumnTreeSchevron";
import {ColumnTreeIcon} from "../components/ColumnTreeIcon";

const NESTING_SPACING = 16;
const LEAF_ICON_WIDTH = 30;

export const ColumnTreeContainer: React.FC<IClassProps> = (props) => {
    const {bc, pageStore, disabled} = props;
    const record = React.useContext(RecordContext) || {};
    const isLeaf = record[VAR_RECORD_LEAF] === "true";
    const addPadding = isLeaf ? LEAF_ICON_WIDTH : 0;
    const value = record && bc.column ? record[bc.column] : undefined;

    return (
        <span
            style={{
                paddingLeft: record.nesting ? Number(record.nesting) * NESTING_SPACING + addPadding : addPadding,
            }}
        >
            {isLeaf ? null : <ColumnTreeSchevron bc={bc} record={record} pageStore={pageStore} disabled={disabled} />}
            <ColumnTreeIcon pageStore={pageStore} bc={bc} record={record} />
            {bc.localization || record.type === "root" ? (
                <Translation ns={bc.localization}>
                    {(trans) =>
                        trans(record.type === "root" ? "static:e3e33760864d44f88a9ecfe8f5da7a0b" : String(value))
                    }
                </Translation>
            ) : (
                value
            )}
        </span>
    );
};