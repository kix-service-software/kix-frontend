import { AbstractTableLayer, TableRow, TableColumn } from "../../../";
import { Version } from "../../../../model";
import { ConfigItemVersionLabelProvider } from "../../ConfigItemVersionLabelProvider";

export class ConfigItemVersionTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new ConfigItemVersionLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<Version>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = await this.setTableValues(rows[i]);
            row.classes = this.labelProvider.getObjectClasses(row.object);
            result.push(row);
        }
        return result;
    }

    protected async setTableValues(row: TableRow<Version>): Promise<TableRow<Version>> {
        for (const value of row.values) {
            value.displayValue = await this.labelProvider.getDisplayText(row.object, value.columnId);
            value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
        }
        row.classes = this.labelProvider.getObjectClasses(row.object);
        return row;
    }

}
