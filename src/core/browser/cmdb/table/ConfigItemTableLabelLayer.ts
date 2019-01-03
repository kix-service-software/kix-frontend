import { AbstractTableLayer, TableRow, TableColumn } from "../..";
import { ConfigItemLabelProvider } from "../ConfigItemLabelProvider";
import { ConfigItem, ConfigItemProperty } from "../../../model";

export class ConfigItemTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new ConfigItemLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            switch (col.id) {
                case ConfigItemProperty.CLASS_ID:
                case ConfigItemProperty.NUMBER:
                case ConfigItemProperty.NAME:
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                case ConfigItemProperty.VERSION:
                case ConfigItemProperty.CREATE_BY:
                case ConfigItemProperty.CREATE_TIME:
                case ConfigItemProperty.CHANGE_BY:
                case ConfigItemProperty.CHANGE_TIME:
                case ConfigItemProperty.CLASS:
                case ConfigItemProperty.IMAGES:
                case ConfigItemProperty.LAST_VERSION_ID:
                case ConfigItemProperty.VERSIONS:
                    col.text = await this.labelProvider.getPropertyText(col.id, null, true);
                    break;
                default:
            }
        }
        return columns;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<ConfigItem>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = await this.setTableValues(rows[i]);
            row.classes = this.labelProvider.getObjectClasses(row.object);
            result.push(row);
        }
        return result;
    }

    protected async setTableValues(row: TableRow<ConfigItem>): Promise<TableRow<ConfigItem>> {
        for (const value of row.values) {
            value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
            value.icons = await this.labelProvider.getIcons(row.object, value.columnId);
        }
        row.classes = this.labelProvider.getObjectClasses(row.object);
        return row;
    }

}
