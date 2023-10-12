/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from '../../../model/configuration/IColumnConfiguration';
import { UIFilterCriterion } from '../../../model/UIFilterCriterion';
import { FilterUtil } from '../../base-components/webapp/core/FilterUtil';
import { Row } from './Row';
import { TableValue } from './TableValue';

export class Cell {

    public constructor(
        private row: Row,
        private tableValue: TableValue
    ) { }

    public async initDisplayValue(): Promise<void> {
        await this.tableValue.initDisplayValue(this);
    }

    public getRow(): Row {
        return this.row;
    }

    public getProperty(): string {
        return this.tableValue.property;
    }

    public getValue(): TableValue {
        return this.tableValue;
    }

    public async setValue(value: TableValue): Promise<void> {
        this.tableValue = value;
        await this.getDisplayValue(true);
    }

    public getDisplayValue(changed: boolean = false): string {
        return this.getValue().displayValue;
    }

    public async filter(filterValue: string, criteria: UIFilterCriterion[]): Promise<boolean> {
        const matchTextFilter = await this.matchDisplayValue(filterValue);
        const matchCriteria = await this.matchCriteria(criteria);
        return matchTextFilter && matchCriteria;
    }

    private matchDisplayValue(filterValue: string): boolean {
        if (!filterValue || filterValue === '') {
            return true;
        }

        return FilterUtil.stringContains(this.tableValue.displayValue, filterValue);
    }

    private async matchCriteria(criteria: UIFilterCriterion[]): Promise<boolean> {

        if (!criteria || criteria.length === 0) {
            return true;
        }

        const filterCriteria = criteria.filter((c) => c.property === this.tableValue.property);

        if (filterCriteria.length === 0) {
            return false;
        }

        let match = false;

        const matchPromises = [];
        filterCriteria.forEach((c) => matchPromises.push(
            FilterUtil.checkUIFilterCriterion(
                c.useDisplayValue || this.tableValue.objectValue === null || typeof this.tableValue.objectValue === 'undefined'
                    ? this.tableValue.displayValue : this.tableValue.objectValue, c.operator, c.value
            )
        ));

        const result = await Promise.all<boolean>(matchPromises);
        match = result.every((r) => r);

        return match;
    }

    public getColumnConfiguration(): IColumnConfiguration {
        const table = this.row ? this.row.getTable() : null;
        const column = table ? table.getColumn(this.tableValue.property) : null;
        return column ? column.getColumnConfiguration() : null;
    }
}
