/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Ticket, KIXObjectType, Article, DynamicField, Link, TicketHistory, TicketProperty, KIXObjectProperty
} from "../../model";
import { ObjectFactory } from "./ObjectFactory";
import { KIXObjectServiceRegistry } from "../KIXObjectServiceRegistry";
import { UserService } from "../impl/api/UserService";

export class TicketFactory extends ObjectFactory<Ticket> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET;
    }

    public async create(ticket: Ticket, token: string): Promise<Ticket> {
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

        await this.initDisplayValues(newTicket, token);

        return newTicket;
    }

    public async initDisplayValues(ticket: Ticket, token: string): Promise<void> {
        await this.getDisplayValue(
            ticket, TicketProperty.QUEUE_ID, token, KIXObjectType.QUEUE, ticket.QueueID, 'Name'
        );
        await this.getDisplayValue(
            ticket, TicketProperty.STATE_ID, token, KIXObjectType.TICKET_STATE, ticket.StateID, 'Name'
        );
        await this.getDisplayValue(
            ticket, TicketProperty.TYPE_ID, token, KIXObjectType.TICKET_TYPE, ticket.TypeID, 'Name'
        );
        await this.getDisplayValue(
            ticket, TicketProperty.ORGANISATION_ID, token, KIXObjectType.ORGANISATION, ticket.OrganisationID, 'Name'
        );
        await this.getDisplayValue(
            ticket, TicketProperty.PRIORITY_ID, token, KIXObjectType.TICKET_PRIORITY, ticket.PriorityID, 'Name'
        );

        await this.getDisplayValue(
            ticket, TicketProperty.OWNER_ID, token, KIXObjectType.USER, ticket.OwnerID, 'UserFullname'
        );

        await this.getDisplayValue(
            ticket, TicketProperty.RESPONSIBLE_ID, token, KIXObjectType.USER, ticket.ResponsibleID, 'UserFullname'
        );

        await this.getDisplayValue(
            ticket, KIXObjectProperty.CREATE_BY, token, KIXObjectType.USER, ticket.CreateBy, 'UserFullname'
        );

        await this.getDisplayValue(
            ticket, KIXObjectProperty.CHANGE_BY, token, KIXObjectType.USER, ticket.ChangeBy, 'UserFullname'
        );
    }

    private async getDisplayValue(
        ticket: Ticket, property: string, token: string, objectType: KIXObjectType,
        id: string | number, displayProperty: string
    ): Promise<void> {
        const service = KIXObjectServiceRegistry.getServiceInstance(objectType);
        if (service) {
            await service.loadObjects(token, '', objectType, [id], null, null)
                .then((objects) => {
                    if (objects && objects.length) {
                        if (objects[0][displayProperty]) {
                            const value = objects[0][displayProperty];
                            ticket.displayValues.push([property, value]);
                        }
                    }
                })
                .catch(() => null);
        }
    }

}
