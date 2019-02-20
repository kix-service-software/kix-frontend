import { IColumn } from "./IColumn";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { ITable } from "./ITable";
import { SortOrder, TableFilterCriteria } from "../../model";
import { SearchOperator } from "../SearchOperator";
import { EventService } from "../event";
import { TableEvent } from "./TableEvent";
import { TableEventData } from "./TableEventData";

export class Column<T = any> implements IColumn<T> {

    private id: string;

    private sortOrder: SortOrder;

    private filterValue: string;
    private filterCriteria: TableFilterCriteria[];

    public constructor(
        private table: ITable,
        private columnConfiguration: IColumnConfiguration
    ) {
        this.id = columnConfiguration.property;
    }

    public getColumnId(): string {
        return this.id;
    }

    public getTable(): ITable {
        return this.table;
    }

    public getColumnConfiguration(): IColumnConfiguration {
        return this.columnConfiguration;
    }

    public getSortOrder(): SortOrder {
        return this.sortOrder;
    }

    public setSortOrder(sortOrder: SortOrder): void {
        this.sortOrder = sortOrder;
    }

    public getFilterValues(): Array<[T, number]> {
        const values: Array<[T, number]> = [];

        this.getTable().getRows(true).forEach((r) => {
            const cell = r.getCell(this.id);
            if (cell) {
                const value = cell.getValue();
                const existingValue = values.find((v) => v[0] === value.objectValue);
                if (existingValue) {
                    existingValue[1] = existingValue[1] + 1;
                } else {
                    values.push([value.objectValue, 1]);
                }
            }
        });

        return values;
    }

    public async filter(filterValues?: T[], textValue?: string): Promise<void> {
        const criteria: TableFilterCriteria[] = [];

        if (filterValues && filterValues.length) {
            criteria.push(new TableFilterCriteria(this.id, SearchOperator.IN, filterValues as any[]));
        }

        this.filterValue = textValue;
        this.filterCriteria = criteria;

        await this.getTable().filter();

        EventService.getInstance().publish(
            TableEvent.COLUMN_FILTERED,
            new TableEventData(this.getTable().getTableId(), null, this.getColumnId())
        );
    }

    public getFilter(): [string, TableFilterCriteria[]] {
        return [this.filterValue, this.filterCriteria];
    }

    public setSize(size: number): void {
        this.columnConfiguration.size = size;
        EventService.getInstance().publish(
            TableEvent.COLUMN_RESIZED,
            new TableEventData(this.getTable().getTableId(), null, this.getColumnId())
        );
    }

    public isFiltered(): boolean {
        const filter = this.getFilter();
        return (filter[0] !== null && filter[0] !== undefined && filter[0] !== '') ||
            (filter[1] !== null && filter[1] !== undefined && filter[1].length > 0);
    }

}
