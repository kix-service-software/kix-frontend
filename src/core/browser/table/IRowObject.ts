import { RowObject } from "./RowObject";
import { TableValue } from "./TableValue";

export interface IRowObject<T = any> {

    getValues(): TableValue[];

    getObject(): T;

    addValue(value: TableValue): void;

    getChildren(): RowObject[];

}
