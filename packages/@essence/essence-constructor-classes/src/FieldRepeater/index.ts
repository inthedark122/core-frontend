import {setComponent} from "@essence-community/constructor-share/components";
import {commonDecorator} from "@essence-community/constructor-share/decorators";
import {FieldRepeaterContainer} from "./containers/FieldRepeaterContainer";

setComponent("IFIELD.repeater", commonDecorator(FieldRepeaterContainer));
