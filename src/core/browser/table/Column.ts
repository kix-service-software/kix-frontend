/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumn } from "./IColumn";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { ITable } from "./ITable";
import { SortOrder, TableFilterCriteria, KIXObject } from "../../model";
import { SearchOperator } from "../SearchOperator";
import { EventService } from "../event";
import { TableEvent } from "./TableEvent";
import { TableEventData } from "./TableEventData";
import { ClientStorageService } from "../ClientStorageService";

export class Column<T extends KIXObject = any> implements IColumn<T> {

    private id: string;

    private sortOrder: SortOrder;

    private filterValue: string;
    private filterCriteria: TableFilterCriteria[];

    public constructor(
        private table: ITable,
        private columnConfiguration: IColumnConfiguration
    ) {
        this.id = columnConfiguration.property;
        const size = ClientStorageService.getOption(this.getSizeConfigurationKey());
        if (size && Number(size)) {
            this.columnConfiguration.size = Number(size);
        }
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
                let cellValues = [];
                const cellValue = cell.getValue();
                if (Array.isArray(cellValue.objectValue)) {
                    cellValues = cellValue.objectValue;
                } else {
                    cellValues.push(cellValue.objectValue);
                }

                cellValues.forEach((value) => {
                    const existingValue = values.find((ev) => {
                        if (ev[0] instanceof KIXObject) {
                            return ev[0].equals(value);
                        }
                        return ev[0] === value;
                    });
                    if (existingValue) {
                        existingValue[1] = existingValue[1] + 1;
                    } else {
                        values.push([value, 1]);
                    }
                });

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
        ClientStorageService.setOption(this.getSizeConfigurationKey(), size.toString());
    }

    public isFiltered(): boolean {
        const filter = this.getFilter();
        return (filter[0] !== null && filter[0] !== undefined && filter[0] !== '') ||
            (filter[1] !== null && filter[1] !== undefined && !!filter[1].length);
    }

    private getSizeConfigurationKey(): string {
        return this.getTable().getTableId() + '-' + this.columnConfiguration.property + '-size';
    }

}
