/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { Ticket } from "../model/Ticket";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { Article } from "../model/Article";
import { TicketHistory } from "../model/TicketHistory";
import { Link } from "../../links/model/Link";

export class TicketFactory extends ObjectFactory<Ticket> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET;
    }

    public async create(ticket: Ticket, token: string): Promise<Ticket> {
        const newTicket = new Ticket(ticket);

        newTicket.Articles = ticket.Articles
            ? ticket.Articles.map((a) => new Article(a))
            : [];

        newTicket.Links = ticket.Links
            ? ticket.Links.map((l) => new Link(l))
            : [];

        newTicket.History = ticket.History
            ? ticket.History.map((th) => new TicketHistory(th))
            : [];

        newTicket.History.sort((a, b) => b.HistoryID - a.HistoryID);

        return newTicket;
    }

}
