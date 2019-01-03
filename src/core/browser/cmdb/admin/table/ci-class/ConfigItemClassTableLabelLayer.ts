import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { ConfigItemClassLabelProvider } from "../../../ConfigItemClassLabelProvider";

export class ConfigItemClassTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new ConfigItemClassLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
