import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { TranslationLanguageLabelProvider } from "../../../TranslationLanguageLabelProvider";

export class TranslationLanguageTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TranslationLanguageLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
