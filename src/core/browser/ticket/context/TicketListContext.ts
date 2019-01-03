import {
    Context, WidgetConfiguration, WidgetType, ConfiguredWidget,
    KIXObjectType, KIXObjectLoadingOptions, Ticket
} from "../../../model";
import { TicketListContextConfiguration } from "./TicketListContextConfiguration";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";

export class TicketListContext extends Context<TicketListContextConfiguration> {

    public static CONTEXT_ID: string = 'ticket-list';

    private text: string = '';

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        return this.text;
    }

    public async loadTickets(ticketIds: number[] = [], text: string = ''): Promise<void> {

        this.text = text;
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, 1000, ['Watchers']);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish('APP_LOADING', { loading: true, hint: 'Lade Tickets ...' });
        }, 500);

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, ticketIds, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(tickets);
        EventService.getInstance().publish('APP_LOADING', { loading: false });
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
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const contentWidget = this.configuration.contentWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = contentWidget ? WidgetType.CONTENT : undefined;

        return widgetType;
    }


}
