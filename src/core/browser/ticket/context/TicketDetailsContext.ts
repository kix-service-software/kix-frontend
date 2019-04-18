import { Context } from '../../../model/components/context/Context';
import {
    Ticket, KIXObject, KIXObjectType, KIXObjectLoadingOptions, BreadcrumbInformation
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
        let object;

        let ticket: Ticket;

        if (!objectType) {
            objectType = KIXObjectType.TICKET;
        }

        ticket = await this.loadTicket(changedProperties);

        if (objectType === KIXObjectType.TICKET) {
            object = ticket;
        } else if (objectType === KIXObjectType.CUSTOMER && ticket) {
            const customers = await KIXObjectService.loadObjects(KIXObjectType.CUSTOMER, [ticket.CustomerID]);
            object = customers && customers.length ? customers[0] : null;
        } else if (objectType === KIXObjectType.CONTACT && ticket) {
            const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [ticket.CustomerUserID]);
            object = contacts && contacts.length ? contacts[0] : null;
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
            null, null, null, null, null,
            ['TimeUnits', 'DynamicFields', 'Links', 'Flags', 'History', 'Watchers', 'Articles', 'Attachments'],
            ['Links']
        );

        const ticketId = Number(this.objectId);
        this.objectId = ticketId;

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Ticket ...`
            });
        }, 500);

        const tickets = await KIXObjectService.loadObjects<Ticket>(
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
            if (!ticket || ticket.CustomerID !== tickets[0].CustomerID) {
                this.listeners.forEach((l) => l.objectChanged(
                    tickets[0].CustomerID,
                    tickets[0].customer,
                    KIXObjectType.CUSTOMER
                ));
            }
            if (!ticket || ticket.CustomerUserID !== tickets[0].CustomerUserID) {
                this.listeners.forEach((l) => l.objectChanged(
                    tickets[0].CustomerUserID,
                    tickets[0].contact,
                    KIXObjectType.CONTACT
                ));
            }
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        return ticket;
    }

}
