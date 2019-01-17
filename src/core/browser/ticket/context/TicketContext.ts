import {
    WidgetType, WidgetConfiguration, Queue, ConfiguredWidget, KIXObjectType,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, TicketProperty, KIXObject
} from "../../../model";
import { TicketContextConfiguration } from "./TicketContextConfiguration";
import { Context } from '../../../model/components/context/Context';
import { KIXObjectService } from "../../kix";
import { SearchOperator } from "../../SearchOperator";
import { EventService } from "../../event";

export class TicketContext extends Context<TicketContextConfiguration> {

    public static CONTEXT_ID: string = 'tickets';

    public queue: Queue;

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        return 'Ticket Dashboard';
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show) {
            content = content.filter(
                (c) => this.configuration.content.findIndex((cid) => c.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const contentWidget = this.configuration.contentWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = contentWidget ? WidgetType.CONTENT : undefined;

        return widgetType;
    }

    public async setQueue(queue: Queue): Promise<void> {
        this.queue = queue;
        await this.loadTickets();
    }

    private async loadTickets(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria('StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'),
        ], null, null, 1000, ['EscalationTime', 'Watchers']);

        if (this.queue) {
            const queueFilter = new FilterCriteria(
                TicketProperty.QUEUE_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.queue.QueueID
            );
            loadingOptions.filter.push(queueFilter);
        }

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish('APP_LOADING', {
                loading: true, hint: `Lade Tickets ...`
            });
        }, 500);

        const tickets = await KIXObjectService.loadObjects(
            KIXObjectType.TICKET, null, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(tickets);

        EventService.getInstance().publish('APP_LOADING', { loading: false });
    }

    public async getObjectList(reload: boolean = false): Promise<KIXObject[]> {
        if (reload) {
            await this.loadTickets();
        }
        return await super.getObjectList();
    }

}
