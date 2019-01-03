import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { TicketPriorityLabelProvider } from "../../../TicketPriorityLabelProvider";

export class TicketPriorityTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TicketPriorityLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
