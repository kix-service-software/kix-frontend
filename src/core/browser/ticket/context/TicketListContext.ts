import {
    Context, KIXObjectType, KIXObjectLoadingOptions, Ticket, KIXObject
} from "../../../model";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";

export class TicketListContext extends Context {

    public static CONTEXT_ID: string = 'ticket-list';

    private text: string = '';
    private ticketIds: number[];

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        return this.text;
    }

    public async loadTickets(ticketIds: number[] = [], text: string = ''): Promise<void> {

        this.text = text;
        this.ticketIds = ticketIds;
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, 1000, ['Watchers']);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Lade Tickets ...' }
            );
        }, 500);

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, this.ticketIds, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(tickets);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public async getObjectList(reload: boolean = false): Promise<KIXObject[]> {
        if (reload) {
            // FIXME: TicketIds neu ermitteln, da ggf. die Tickets garnciht mehr dabei sein könnten (Besitzerwechsel)
            await this.loadTickets(this.ticketIds);
        }
        return await super.getObjectList();
    }
}
