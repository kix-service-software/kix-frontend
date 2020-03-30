/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { Ticket } from "../../../model/Ticket";
import { KIXObject } from "../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { BreadcrumbInformation } from "../../../../../model/BreadcrumbInformation";
import { TicketContext } from "./TicketContext";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { TicketProperty } from "../../../model/TicketProperty";
import { KIXObjectProperty } from "../../../../../model/kix/KIXObjectProperty";
import { ContextDescriptor } from "../../../../../model/ContextDescriptor";
import { ContextConfiguration } from "../../../../../model/configuration/ContextConfiguration";

export class TicketDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-details';

    public constructor(
        protected descriptor: ContextDescriptor,
        protected objectId: string | number = null,
        protected configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, {
            eventSubscriberId: 'TicketDetailsContext',
            eventPublished: (data, eventId: string) => {
                if (data.objectType === KIXObjectType.TICKET) {
                    this.getObject(undefined, true);
                }
            }
        });
    }

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Ticket>(), true, !short);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let object: O;
        let ticket;

        if (!objectType) {
            objectType = KIXObjectType.TICKET;
        }

        ticket = await this.loadTicket(changedProperties);

        if (objectType === KIXObjectType.TICKET) {
            object = ticket;
        } else if (objectType === KIXObjectType.ORGANISATION && ticket) {
            if (!isNaN(ticket.OrganisationID)) {
                const organisations = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [ticket.OrganisationID]
                ).catch(() => []);
                object = organisations && organisations.length ? organisations[0] : null;
            }
        } else if (objectType === KIXObjectType.CONTACT && ticket) {
            if (!isNaN(ticket.ContactID)) {
                const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [ticket.ContactID])
                    .catch(() => []);
                object = contacts && contacts.length ? contacts[0] : null;
            }
        }

        if (reload && objectType === KIXObjectType.TICKET) {
            setTimeout(() => {
                this.listeners.forEach(
                    (l) => l.objectChanged(Number(this.objectId), ticket, KIXObjectType.TICKET, changedProperties)
                );
            }, 20);
        }

        return object;
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Ticket>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [TicketContext.CONTEXT_ID], text);
    }

    private async loadTicket(changedProperties: string[] = [], cache: boolean = true): Promise<Ticket> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                KIXObjectProperty.DYNAMIC_FIELDS, KIXObjectProperty.LINKS,
                TicketProperty.TIME_UNITS, TicketProperty.HISTORY, TicketProperty.WATCHERS, TicketProperty.ARTICLES,
                'Flags', 'Attachments'],
            [KIXObjectProperty.LINKS]
        );

        const ticketId = Number(this.objectId);
        this.objectId = ticketId;

        const tickets: Ticket[] = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, [ticketId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let ticket: Ticket;
        if (tickets && tickets.length) {
            ticket = tickets[0];
            // TODO: in eigenen "Notification" Service auslagern
            if (!ticket || ticket.OrganisationID !== tickets[0].OrganisationID) {
                this.listeners.forEach((l) => l.objectChanged(
                    tickets[0].OrganisationID, null, KIXObjectType.ORGANISATION
                ));
            }
            if (!ticket || ticket.ContactID !== tickets[0].ContactID) {
                this.listeners.forEach((l) => l.objectChanged(
                    tickets[0].ContactID, null, KIXObjectType.CONTACT
                ));
            }

            this.setObjectList(KIXObjectType.ARTICLE, ticket.Articles);
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        return ticket;
    }

}
