import { CustomerLabelProvider } from "..";
import { TableColumn, AbstractTableLayer, TableRow } from "../..";
import { Customer, CustomerProperty, KIXObjectType, TicketProperty } from "../../../model";
import { TicketService } from "../../ticket";

export class CustomerTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new CustomerLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<Customer>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = await this.setTableValues(rows[i]);
            result.push(row);
        }
        return result;
    }

    protected async setTableValues(row: TableRow<Customer>): Promise<TableRow<Customer>> {
        for (const value of row.values) {
            value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
        }
        row.classes = this.labelProvider.getObjectClasses(row.object);
        return row;
    }
}
