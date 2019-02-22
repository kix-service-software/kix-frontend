import { RowObject } from "./RowObject";
import { TableValue } from "./TableValue";
import { ValueState } from "./ValueState";

export interface IRowObject<T = any> {

    getValues(): TableValue[];

    getValueState(): ValueState;

    setValueState(valueState: ValueState): void;

    getObject(): T;

    addValue(value: TableValue): void;

    getChildren(): RowObject[];

}
