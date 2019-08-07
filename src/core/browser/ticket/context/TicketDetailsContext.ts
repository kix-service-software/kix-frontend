/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../model/components/context/Context';
import {
    Ticket, KIXObject, KIXObjectType, KIXObjectLoadingOptions, BreadcrumbInformation, Organisation, Contact
} from '../../../model';
import { TicketContext } from './TicketContext';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { LabelService } from '../../LabelService';
import { ApplicationEvent } from '../../application';

export class TicketDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-details';

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
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [ticket.OrganisationID]
                ).catch(() => []);
                object = organisations && organisations.length ? organisations[0] : null;
            }
        } else if (objectType === KIXObjectType.CONTACT && ticket) {
            if (!isNaN(ticket.ContactID)) {
                const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [ticket.ContactID])
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
            ['TimeUnits', 'DynamicFields', 'Links', 'Flags', 'History', 'Watchers', 'Articles', 'Attachments'],
            ['Links']
        );

        const ticketId = Number(this.objectId);
        this.objectId = ticketId;

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Ticket'
            });
        }, 500);

        const tickets: Ticket[] = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, [ticketId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

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
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        return ticket;
    }

}
