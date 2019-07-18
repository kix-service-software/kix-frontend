/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
