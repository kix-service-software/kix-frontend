import { IColumnConfiguration } from "./IColumnConfiguration";
import { SortOrder, TableFilterCriteria } from "../../model";
import { ITable } from "./ITable";

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
