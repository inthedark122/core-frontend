import * as React from "react";
import {useObserver} from "mobx-react-lite";
import keycode from "keycode";
import {IconButton, InputAdornment} from "@material-ui/core";
import {StandardTextFieldProps} from "@material-ui/core/TextField";
import {IBuilderConfig, Icon, IFieldProps} from "@essence/essence-constructor-share";
import {FieldComboModel} from "../store/FieldComboModel";
import {ISuggestion} from "../store/FieldComboModel.types";
import {useStyles} from "./FieldComboInput.styles";

interface IProps extends IFieldProps {
    textField: React.ComponentType<StandardTextFieldProps>;
    open: boolean;
    store: FieldComboModel;
    bc: IBuilderConfig;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
    onClose: (event: React.SyntheticEvent) => void;
    onOpen: (event: React.SyntheticEvent) => void;
}

export const FieldComboInput: React.FC<IProps> = React.memo((props) => {
    const classes = useStyles(props);
    const {textField: TextField, onClose, onOpen, open, ...otherProps} = props;
    const handleInputClick = (event: React.SyntheticEvent) => {
        onOpen(event);
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;

        if (props.bc.allownew === "true") {
            const lowerValue = value.toLowerCase();
            const sugValue = props.store.suggestions.find((sug: ISuggestion) => sug.labelLower === lowerValue);
            const newValue = sugValue ? sugValue.value : value;

            props.onChange(event, newValue);
            props.store.handleChangeValue(value);
        } else {
            props.store.handleChangeValue(value);
        }

        onOpen(event);
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // @ts-ignore
        const code = keycode(event);

        switch (code) {
            case "up":
            case "down":
                event.preventDefault();
                onOpen(event);
                props.store.handleChangeSelected(code);
                break;
            case "esc":
                onClose(event);
                break;
            case "enter":
                if (props.store.highlightedValue) {
                    event.preventDefault();
                    onClose(event);
                    props.onChange(null, props.store.highlightedValue);
                }
                break;
            default:
            // No need
        }
    };
    const handleButtonUp = (event: React.SyntheticEvent) => {
        event.stopPropagation();
        onClose(event);
    };
    const handlFocusInput = (event: React.FocusEvent) => {
        event.preventDefault();
        if (props.inputRef.current) {
            props.inputRef.current.focus();
        }
    };
    const handleBlur = () => {
        props.store.handleSetIsFocus(false);
    };
    const handleFocus = () => {
        props.store.handleSetIsFocus(true);
    };
    const chevron = open ? (
        <IconButton
            color="secondary"
            disableRipple
            tabIndex={-1}
            className={classes.iconRoot}
            data-page-object={`${props.bc.ckPageObject}-chevron-up`}
            onFocus={handlFocusInput}
            onClick={handleButtonUp}
            disabled={props.disabled}
        >
            <Icon iconfont="chevron-up" />
        </IconButton>
    ) : (
        <IconButton
            color="secondary"
            disableRipple
            tabIndex={-1}
            className={classes.iconRoot}
            data-page-object={`${props.bc.ckPageObject}-chevron-down`}
            onFocus={handlFocusInput}
            disabled={props.disabled}
        >
            <Icon iconfont="chevron-down" />
        </IconButton>
    );

    return useObserver(() => (
        <TextField
            {...otherProps}
            InputProps={{
                ...otherProps.InputProps,
                endAdornment: <InputAdornment position="end">{[...props.tips, chevron]}</InputAdornment>,
            }}
            value={props.store.inputValue}
            onClick={props.disabled ? undefined : handleInputClick}
            onChange={props.disabled ? undefined : handleChange}
            onKeyDown={props.disabled ? undefined : handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
        />
    ));
});
