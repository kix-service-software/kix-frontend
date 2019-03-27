import { ITableCSSHandler, TableValue } from "../../table";
import { Ticket, TicketProperty } from "../../../model";

export class TicketTableCSSHandler implements ITableCSSHandler<Ticket> {

    public getRowCSSClasses(ticket: Ticket): string[] {
        const classes = [];

        if (ticket) {
            if (ticket.Unseen) {
                classes.push("article-unread");
            }
        }

        return classes;
    }

    public getValueCSSClasses(ticket: Ticket, value: TableValue): string[] {
        const classes = [];
        switch (value.property) {
            case TicketProperty.UNSEEN:
                classes.push('unseen');
                break;
            default:
        }
        return classes;
    }

}
