import { IRow } from "./IRow";
import { IColumn } from "./IColumn";
import { ITableContentProvider } from "./ITableContentProvider";
import { IRowObject } from "./IRowObject";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { KIXObjectType, TableFilterCriteria, SortOrder } from "../../model";
import { SelectionState } from "./SelectionState";
import { TableConfiguration } from "./TableConfiguration";
import { ValueState } from "./ValueState";

export interface ITable {

    getTableId(): string;

    getContextId(): string;

    initialize(reset?: boolean): Promise<void>;

    getTableConfiguration(): TableConfiguration;

    getObjectType(): KIXObjectType;

    setContentProvider(tableContentProvider: ITableContentProvider): void;

    setColumnConfiguration(columnConfiguration: IColumnConfiguration[]): any;

    createRow(tableObject?: IRowObject): IRow;

    getRows(all?: boolean): IRow[];

    getSelectedRows(all?: boolean): IRow[];

    getRow(rowId: string): IRow;

    removeRows(rowIds: string[]): IRow[];

    addRows(addRows: IRow[], index?: number): void;

    replaceRows(replaceRows: Array<[string, IRow]>): IRow[];

    createColumn(columnConfiguration: IColumnConfiguration): IColumn;

    getColumns(): IColumn[];

    getColumn(columnId: string): IColumn;

    removeColumns(columnIds: string[]): IColumn[];

    addColumns(columns: IColumnConfiguration[]): void;

    replaceColumns(replaceColumns: Array<[string, IColumn]>): IColumn[];

    setFilter(filterValue?: string, criteria?: TableFilterCriteria[]): void;

    filter(): Promise<void>;

    sort(columnId: string, sortOrder: SortOrder): Promise<void>;

    setRowSelection(rowIds: string[]): void;

    selectAll(withoutFilter?: boolean): void;

    selectNone(withoutFilter?: boolean): void;

    selectRowByObject(object: any, select?: boolean): void;

    setRowsSelectableByObject(object: any[], selectable: boolean): void;

    getRowSelectionState(all?: boolean): SelectionState;

    setRowObjectValues(values: Array<[any, [string, any]]>): void;

    reload(keepSelection?: boolean): Promise<void>;

    switchColumnOrder(): void;

    resetFilter(): void;

    isFiltered(): boolean;

    setRowObjectValueState(objects: any[], state: ValueState): void;

    getRowByObjectId(objectId: string | number): IRow;

    destroy(): void;

    getRowCount(): number;

}
