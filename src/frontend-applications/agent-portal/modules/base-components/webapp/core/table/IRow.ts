/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ICell } from './ICell';
import { IRowObject } from './IRowObject';
import { ITable } from './ITable';
import { TableValue } from './TableValue';
import { ValueState } from './ValueState';
import { TableFilterCriteria } from '../../../../../model/TableFilterCriteria';
import { SortOrder } from '../../../../../model/SortOrder';
import { DataType } from '../../../../../model/DataType';

export interface IRow<T = any> {

    getCell(property: string): ICell;

    getRowId(): string;

    getTable(): ITable;

    getRowObject(): IRowObject<T>;

    getCells(): ICell[];

    filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean>;

    isSelected(): boolean;

    select(selected?: boolean, selectChildren?: boolean, withoutFilter?: boolean, silent?: boolean): void;

    isSelectable(): boolean;

    selectable(selectable?: boolean): void;

    isExpanded(): boolean;

    expand(expanded?: boolean): void;

    updateValues(): void;

    getChildren(): IRow[];

    setValueState(state: ValueState): void;

    addCell(value: TableValue): void;

    getRowCount(): number;

    sortChildren(columnId: string, sortOrder: SortOrder, dataType: DataType): void;

}
