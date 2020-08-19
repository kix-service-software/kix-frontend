/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumn } from './IColumn';
import { ITable } from './ITable';
import { TableEvent } from './TableEvent';
import { TableEventData } from './TableEventData';
import { ClientStorageService } from '../ClientStorageService';
import { TableFactoryService } from './TableFactoryService';
import { TableFactory } from './TableFactory';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { SortOrder } from '../../../../../model/SortOrder';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { EventService } from '../EventService';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';

export class Column<T extends KIXObject = any> implements IColumn<T> {

    private id: string;

    private sortOrder: SortOrder;

    private filterValue: string;
    private filterCriteria: UIFilterCriterion[];

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
        let values = [];
        const tableFactory = TableFactoryService.getInstance().getTableFactory(this.getTable().getObjectType());
        if (tableFactory) {
            values = tableFactory.getColumnFilterValues(this.getTable().getRows(true), this);
        } else {
            values = TableFactory.getColumnFilterValues(this.getTable().getRows(true), this);
        }
        return values;
    }

    public async filter(filterValues?: T[], textValue?: string): Promise<void> {
        const criteria: UIFilterCriterion[] = [];

        if (filterValues && filterValues.length) {
            criteria.push(new UIFilterCriterion(
                this.id, SearchOperator.IN, filterValues as any[], this.columnConfiguration.useObjectServiceForFilter)
            );
        }

        this.filterValue = textValue;
        this.filterCriteria = criteria;

        await this.getTable().filter();

        EventService.getInstance().publish(
            TableEvent.COLUMN_FILTERED,
            new TableEventData(this.getTable().getTableId(), null, this.getColumnId())
        );
    }

    public getFilter(): [string, UIFilterCriterion[]] {
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
