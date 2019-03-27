import { Context } from '../../../model/components/context/Context';
import { TicketDetailsContextConfiguration } from '..';
import {
    ConfiguredWidget, WidgetConfiguration, WidgetType,
    Ticket, KIXObject, KIXObjectType, KIXObjectLoadingOptions, BreadcrumbInformation,
} from '../../../model';
import { TicketContext } from './TicketContext';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { LabelService } from '../../LabelService';
import { ApplicationEvent } from '../../application';

export class TicketDetailsContext extends Context<TicketDetailsContextConfiguration> {

    public static CONTEXT_ID = 'ticket-details';

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Ticket>(), true, !short);
    }

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.sidebars.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        configuration = laneWidget ? laneWidget.configuration : undefined;

        if (!configuration) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
        }

        if (!configuration) {
            const contentWidget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
            configuration = contentWidget ? contentWidget.configuration : undefined;
        }

        return configuration;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = laneWidget ? WidgetType.LANE : undefined;

        if (!widgetType) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            widgetType = laneTabWidget ? WidgetType.LANE_TAB : undefined;
        }

        return widgetType;
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
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), ticket, KIXObjectType.TICKET, changedProperties)
            );
        }

        return object;
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Ticket>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [TicketContext.CONTEXT_ID], text);
    }

    private async loadTicket(changedProperties: string[] = [], cache: boolean = true): Promise<Ticket> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Ticket ...' }
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null,
            ['TimeUnits', 'DynamicFields', 'Links', 'Flags', 'History', 'Watchers', 'Articles', 'Attachments'],
            ['Links']
        );

        const ticketId = Number(this.objectId);
        this.objectId = ticketId;

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, [ticketId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let ticket;
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

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticket;
    }

}
