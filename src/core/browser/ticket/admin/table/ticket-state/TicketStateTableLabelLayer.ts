import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { TicketStateLabelProvider } from "../../../TicketStateLabelProvider";

export class TicketStateTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TicketStateLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
