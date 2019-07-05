import { ValueState } from "./ValueState";
import { ObjectIcon } from "../../model";

export class TableValue {

    public constructor(
        public property: string,
        public objectValue: any,
        public displayValue: string = null,
        public state: ValueState = ValueState.NONE,
        public displayIcons: Array<ObjectIcon | string> = null
    ) { }

}
