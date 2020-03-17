/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from "../../../../../model/configuration/IColumnConfiguration";
import { ITable } from "./ITable";
import { SortOrder } from "../../../../../model/SortOrder";
import { TableFilterCriteria } from "../../../../../model/TableFilterCriteria";

export interface IColumn<T = any> {

    getColumnId(): string;

    getTable(): ITable;

    getColumnConfiguration(): IColumnConfiguration;

    getSortOrder(): SortOrder;

    setSortOrder(sortOrder: SortOrder): void;

    getFilterValues(): Array<[T, number]>;

    filter(filterValues?: T[], textValue?: string): Promise<void>;

    getFilter(): [string, TableFilterCriteria[]];

    setSize(size: number): void;

    isFiltered(): boolean;

}
