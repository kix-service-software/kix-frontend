import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { TranslationLabelProvider } from "../../../TranslationLabelProvider";

export class TranslationTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TranslationLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
