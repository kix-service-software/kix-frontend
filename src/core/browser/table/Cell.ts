import { ICell } from "./ICell";
import { IRow } from "./IRow";
import { LabelService } from "../LabelService";
import { TableFilterCriteria, FilterUtil, ObjectIcon } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableValue } from "./TableValue";

export class Cell implements ICell {

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

    public async getDisplayValue(): Promise<string> {
        let value = this.tableValue.objectValue ? this.tableValue.objectValue : '';
        const object = this.getRow().getRowObject().getObject();

        if (object) {
            value = await LabelService.getInstance().getPropertyValueDisplayText(
                object, this.tableValue.property,
                this.tableValue.objectValue ? this.tableValue.objectValue.toString() : ''
            );
        } else {
            const objectType = this.getRow().getTable().getObjectType();
            const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
            if (labelProvider) {
                value = await labelProvider.getPropertyValueDisplayText(
                    this.tableValue.property, this.tableValue.objectValue ? this.tableValue.objectValue.toString() : ''
                );
            }
        }
        return value ? value : '';
    }

    public async filter(filterValue: string, criteria: TableFilterCriteria[]): Promise<boolean> {
        const matchTextFilter = await this.matchDisplayValue(filterValue);
        const matchCriteria = await this.matchCriteria(criteria);
        return matchTextFilter && matchCriteria;
    }

    private async matchDisplayValue(filterValue: string): Promise<boolean> {
        if (!filterValue || filterValue === '') {
            return true;
        }

        const displayValue = await this.getDisplayValue();
        return FilterUtil.stringContains(displayValue, filterValue);
    }

    private async matchCriteria(criteria: TableFilterCriteria[]): Promise<boolean> {

        if (!criteria || criteria.length === 0) {
            return true;
        }

        const filterCriteria = criteria.filter((c) => c.property === this.tableValue.property);

        if (filterCriteria.length === 0) {
            return false;
        }

        const match = filterCriteria.every((c) => FilterUtil.checkTableFilterCriteria(c, this.tableValue.objectValue));

        return match;
    }

    public async getDisplayIcons(): Promise<Array<string | ObjectIcon>> {
        let icons;
        const rowObject = this.getRow().getRowObject().getObject();
        if (rowObject) {
            icons = await LabelService.getInstance().getPropertyValueDisplayIcons(
                rowObject, this.tableValue.property
            );
        }
        return icons;
    }

    public getColumnConfiguration(): IColumnConfiguration {
        const table = this.row ? this.row.getTable() : null;
        const column = table ? table.getColumn(this.tableValue.property) : null;
        return column ? column.getColumnConfiguration() : null;
    }
}
