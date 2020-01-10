/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ICell } from "./ICell";
import { IRow } from "./IRow";
import { LabelService } from "../LabelService";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableValue } from "./TableValue";
import { TableFilterCriteria } from "../../../../../model/TableFilterCriteria";
import { FilterUtil } from "../FilterUtil";

export class Cell implements ICell {

    private loadingPromise: Promise<string>;

    public constructor(
        private row: IRow,
        private tableValue: TableValue
    ) { }

    public getRow(): IRow {
        return this.row;
    }

    public getProperty(): string {
        return this.tableValue.property;
    }

    public getValue(): TableValue {
        return this.tableValue;
    }

    public setValue(value: TableValue): void {
        this.tableValue = value;
    }

    public async getDisplayValue(): Promise<string> {
        if (this.getValue().displayValue) {
            return this.getValue().displayValue;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise<string>(async (resolve, reject) => {

            let value: string;
            const object = this.getRow().getRowObject().getObject();

            const columnConfiguration = this.getColumnConfiguration();
            const translatable = columnConfiguration ? columnConfiguration.translatable : true;

            if (object) {
                value = await LabelService.getInstance().getPropertyValueDisplayText(
                    object, this.tableValue.property, null, translatable
                );
            } else {
                const objectType = this.getRow().getTable().getObjectType();
                const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
                if (labelProvider) {
                    value = await labelProvider.getPropertyValueDisplayText(
                        this.tableValue.property,
                        this.tableValue.objectValue ? this.tableValue.objectValue.toString() : null,
                        translatable
                    );
                }
            }
            this.getValue().displayValue = value;

            resolve(value);
            this.loadingPromise = null;
        });

        return this.loadingPromise;
    }

    public async filter(filterValue: string, criteria: TableFilterCriteria[]): Promise<boolean> {
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

    private async matchCriteria(criteria: TableFilterCriteria[]): Promise<boolean> {

        if (!criteria || criteria.length === 0) {
            return true;
        }

        const filterCriteria = criteria.filter((c) => c.property === this.tableValue.property);

        if (filterCriteria.length === 0) {
            return false;
        }

        let match = false;

        const matchPromises = [];
        filterCriteria.forEach(
            (c) => matchPromises.push(FilterUtil.checkTableFilterCriteria(
                c, c.useDisplayValue ? this.tableValue.displayValue : this.tableValue.objectValue
            ))
        );

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
