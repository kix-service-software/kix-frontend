/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from '../../../model/configuration/IColumnConfiguration';
import { KIXObject } from '../../../model/kix/KIXObject';
import { SortOrder } from '../../../model/SortOrder';
import { UIFilterCriterion } from '../../../model/UIFilterCriterion';
import { ClientStorageService } from '../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../base-components/webapp/core/EventService';
import { SearchOperator } from '../../search/model/SearchOperator';
import { TableFactory } from '../webapp/core/factory/TableFactory';
import { TableFactoryService } from '../webapp/core/factory/TableFactoryService';
import { TableEvent } from './TableEvent';
import { Table } from './Table';
import { TableEventData } from './TableEventData';

export class Column<T extends KIXObject = any> {

    private id: string;

    private sortOrder: SortOrder;

    private filterValue: string;
    private filterCriteria: UIFilterCriterion[];

    public constructor(
        private table: Table,
        private columnConfiguration: IColumnConfiguration
    ) {
        this.id = columnConfiguration.property;
        const size = ClientStorageService.getOption(this.getConfigurationKey('size'));
        if (size && Number(size)) {
            this.columnConfiguration.size = Number(size);
        }

        const sort = ClientStorageService.getOption(this.getConfigurationKey('sort'));
        if (sort) {
            this.sortOrder = sort as any;
        }

        const filterDefinitionString = ClientStorageService.getOption(this.getConfigurationKey('filter'));
        if (filterDefinitionString) {
            try {
                const filterDefinition = JSON.parse(filterDefinitionString);
                this.filterValue = filterDefinition.filterValue;
                this.filterCriteria = filterDefinition.filterCriteria;
            } catch (e) {
                console.error('Could not load filter definition for column.');
                console.error(e);
            }
        }
    }

    public getColumnId(): string {
        return this.id;
    }

    public getTable(): Table {
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


        const filterDefinition = { filterValue: this.filterValue, filterCriteria: this.filterCriteria };
        try {
            ClientStorageService.setOption(this.getConfigurationKey('filter'), JSON.stringify(filterDefinition));
        } catch (e) {
            console.error('Could not save filter definition for column.');
            console.error(e);
        }

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
        EventService.getInstance().publish(
            TableEvent.COLUMN_RESIZED,
            new TableEventData(this.getTable().getTableId(), null, this.getColumnId())
        );
    }

    public isFiltered(): boolean {
        const filter = this.getFilter();
        return (filter[0] !== null && filter[0] !== undefined && filter[0] !== '') ||
            (filter[1] !== null && filter[1] !== undefined && !!filter[1].length);
    }

    private getConfigurationKey(name: string): string {
        return `${this.getTable().getTableId()}-${this.columnConfiguration.property}-${name}`;
    }

}
