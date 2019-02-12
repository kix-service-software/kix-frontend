import { AbstractTableLayer, TableColumn } from "../../../../standard-table";
import { TicketTypeLabelProvider } from "../../../TicketTypeLabelProvider";

export class TicketTypeTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TicketTypeLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

}
