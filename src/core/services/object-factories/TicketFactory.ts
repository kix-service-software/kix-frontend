import { Ticket, KIXObjectType, Article, DynamicField, Link, TicketHistory, CRUD } from "../../model";
import { ObjectFactory } from "./ObjectFactory";

export class TicketFactory extends ObjectFactory<Ticket> {

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
            ? ticket.Links.map((l) => new Link(l))
            : [];

        newTicket.History = ticket.History
            ? ticket.History.map((th) => new TicketHistory(th))
            : [];

        return newTicket;
    }

    // public async applyPermissions(token: string, ticket: Ticket): Promise<Ticket> {

    //     if (await this.readAccessDenied(token, 'system/ticket/states')) {
    //         delete ticket.StateID;
    //     }

    //     if (await this.readAccessDenied(token, 'priorities')) {
    //         delete ticket.PriorityID;
    //     }

    //     if (await this.readAccessDenied(token, 'ticketlocks')) {
    //         delete ticket.LockID;
    //     }

    //     if (await this.readAccessDenied(token, 'queues')) {
    //         delete ticket.QueueID;
    //     }

    //     if (await this.readAccessDenied(token, 'organisations')) {
    //         delete ticket.OrganisationID;
    //     }

    //     if (await this.readAccessDenied(token, 'contacts')) {
    //         delete ticket.ContactID;
    //     }

    //     if (await this.readAccessDenied(token, 'system/users')) {
    //         delete ticket.OwnerID;
    //         delete ticket.ResponsibleID;
    //     }

    //     if (await this.readAccessDenied(token, 'system/ticket/types')) {
    //         delete ticket.TypeID;
    //     }

    //     if (await this.readAccessDenied(token, 'slas')) {
    //         delete ticket.SLAID;
    //     }

    //     if (await this.readAccessDenied(token, 'services')) {
    //         delete ticket.ServiceID;
    //     }

    //     if (await this.readAccessDenied(token, 'tickets/*/articles')) {
    //         delete ticket.Articles;
    //     }

    //     if (await this.readAccessDenied(token, 'tickets/*/history')) {
    //         delete ticket.History;
    //     }

    //     if (await this.readAccessDenied(token, 'tickets/*/watchers')) {
    //         delete ticket.Watchers;
    //     }

    //     return ticket;
    // }

}
