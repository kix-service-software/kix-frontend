import { TableRow } from "..";
import { KIXObject } from "../../../model";

export interface ITableSelectionListener<T extends KIXObject<T> = KIXObject> {

    selectionChanged(row: TableRow<T>, selected: boolean): void;

    selectAll(rows: Array<TableRow<T>>): void;

    selectNone(): void;

    isRowSelected(row: TableRow<T>): boolean;

    isAllSelected(): boolean;

    getSelectedObjects(): T[];

    addListener(listener: (objects: T[]) => void): void;

    updateSelections(updatedRows: Array<TableRow<T>>): void;
}
