import { AbstractTableLayer, TableColumn, TableRow } from "../../..";
import { ConfigItemHistoryLabelProvider } from "../..";
import { ConfigItemHistory } from "../../../../model";

export class ConfigItemHistoryTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new ConfigItemHistoryLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.getColumnTitle(col.id);
        }
        return columns;
    }

    private async getColumnTitle(columnId: string): Promise<string> {
        return await this.labelProvider.getPropertyText(columnId);
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<ConfigItemHistory>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (const value of row.values) {
                value.displayValue = await this.labelProvider.getDisplayText(row.object, value.columnId);
                value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
                if (value.columnId === 'Content' && value.displayValue) {
                    value.icons = ['kix-icon-open-right'];
                }
            }
            row.classes = this.labelProvider.getObjectClasses(row.object);
        }
        return rows;
    }
}
