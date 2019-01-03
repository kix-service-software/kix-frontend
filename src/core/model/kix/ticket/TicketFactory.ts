import { Ticket, ArticleFactory, TicketHistoryFactory } from ".";
import { Customer, Contact, LinkFactory } from "..";
import { DynamicField } from "../dynamic-field";

export class TicketFactory {

    public static create(ticket: Ticket, customer?: Customer, contact?: Contact): Ticket {
        const newTicket = new Ticket(ticket);

        newTicket.Articles = ticket.Articles
            ? ticket.Articles.map((a) => ArticleFactory.create(a))
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

        newTicket.contact = contact || ticket.contact;
        newTicket.customer = customer || ticket.customer;

        return newTicket;
    }

}
