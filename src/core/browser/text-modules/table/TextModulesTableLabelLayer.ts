import { AbstractTableLayer, TableColumn } from "../../standard-table";
import { TextModuleLabelProvider } from "../TextModuleLabelProvider";

export class TextModulesTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TextModuleLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
