import { IRowObject } from "./IRowObject";
import { ICell } from "./ICell";
import { ITable } from "./ITable";
import { TableFilterCriteria } from "../../model";
import { ValueState } from "./ValueState";
import { TableValue } from "./TableValue";

export interface IRow<T = any> {

    getCell(property: string): ICell;

    getRowId(): string;

    getTable(): ITable;

    getRowObject(): IRowObject<T>;

    getCells(): ICell[];

    filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean>;

    isSelected(): boolean;

    select(selected?: boolean): void;

    isSelectable(): boolean;

    selectable(selectable?: boolean): void;

    isExpanded(): boolean;

    expand(expanded?: boolean): void;

    updateValues(): void;

    getChildren(): IRow[];

    setValueState(state: ValueState): void;

    addCell(value: TableValue): void;

    getRowCount(): number;

}
