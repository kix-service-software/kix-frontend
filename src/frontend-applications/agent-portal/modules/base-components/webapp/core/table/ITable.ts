/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRow } from "./IRow";
import { IColumn } from "./IColumn";
import { ITableContentProvider } from "./ITableContentProvider";
import { IRowObject } from "./IRowObject";
import { IColumnConfiguration } from "../../../../../model/configuration/IColumnConfiguration";
import { SelectionState } from "./SelectionState";
import { TableConfiguration } from "../../../../../model/configuration/TableConfiguration";
import { ValueState } from "./ValueState";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { TableFilterCriteria } from "../../../../../model/TableFilterCriteria";
import { SortOrder } from "../../../../../model/SortOrder";

export interface ITable {

    getTableId(): string;

    getContextId(): string;

    initialize(): Promise<void>;

    getTableConfiguration(): TableConfiguration;

    getObjectType(): KIXObjectType | string;

    setContentProvider(tableContentProvider: ITableContentProvider): void;

    setColumnConfiguration(columnConfiguration: IColumnConfiguration[]): any;

    createRow(tableObject?: IRowObject): IRow;

    getRows(all?: boolean): IRow[];

    getSelectedRows(all?: boolean): IRow[];

    getRow(rowId: string): IRow;

    removeRows(rowIds: string[]): IRow[];

    addRows(addRows: IRow[], index?: number): void;

    replaceRows(replaceRows: Array<[string, IRow]>): IRow[];

    getColumns(): IColumn[];

    getColumn(columnId: string): IColumn;

    removeColumns(columnIds: string[]): IColumn[] | IColumnConfiguration[];

    addColumns(columns: IColumnConfiguration[]): Promise<void>;

    setFilter(filterValue?: string, criteria?: TableFilterCriteria[]): void;

    filter(): Promise<void>;

    sort(columnId: string, sortOrder: SortOrder): Promise<void>;

    setRowSelection(rowIds: string[]): void;

    setRowSelectionByObject(objects: any[]): void;

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

    getRowCount(all?: boolean): number;

}
