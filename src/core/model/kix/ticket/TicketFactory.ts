import { Ticket, ArticleFactory, TicketHistoryFactory } from ".";
import { LinkFactory } from "..";
import { DynamicField } from "../dynamic-field";
import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";
import { Article } from "./Article";

export class TicketFactory implements IObjectFactory<Ticket> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET;
    }

    public create(ticket: Ticket): Ticket {
        const newTicket = new Ticket(ticket);

        newTicket.Articles = ticket.Articles
            ? ticket.Articles.map((a) => new Article(a))
            : [];

        newTicket.DynamicFields = ticket.DynamicFields
            ? ticket.DynamicFields.map((df) => new DynamicField(df))
            : [];

        newTicket.Links = ticket.Links
            ? ticket.Links.map((l) => LinkFactory.create(l))
            : [];

        newTicket.History = ticket.History
            ? ticket.History.map((th) => TicketHistoryFactory.create(th))
            : [];

        return newTicket;
    }

}
