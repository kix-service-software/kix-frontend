import {
    KIXObjectType, KIXObjectLoadingOptions, FilterCriteria, FilterDataType,
    FilterType, TicketProperty, KIXObject, SysConfigOption, SysConfigKey
} from "../../../model";
import { Context } from '../../../model/components/context/Context';
import { KIXObjectService } from "../../kix";
import { SearchOperator } from "../../SearchOperator";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";

export class TicketContext extends Context {

    public static CONTEXT_ID: string = 'tickets';

    public queueId: number;

    public getIcon(): string {
        return 'kix-icon-ticket';
    }

    public async getDisplayText(): Promise<string> {
        return 'Ticket Dashboard';
    }

    public async setQueue(queueId: number): Promise<void> {
        this.queueId = queueId;
        await this.loadTickets();
    }

    private async loadTickets(): Promise<void> {
        const viewableStateTypes = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_VIEWABLE_STATE_TYPE]
        );

        const stateTypeFilterCriteria = new FilterCriteria(
            'StateType', SearchOperator.IN, FilterDataType.STRING, FilterType.AND,
            viewableStateTypes && viewableStateTypes.length ? viewableStateTypes[0].Value : []
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            [stateTypeFilterCriteria], null, 1000, ['Watchers']
        );

        if (this.queueId) {
            const queueFilter = new FilterCriteria(
                TicketProperty.QUEUE_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.queueId
            );
            loadingOptions.filter.push(queueFilter);
        }

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Tickets ...`
            });
        }, 500);

        const tickets = await KIXObjectService.loadObjects(
            KIXObjectType.TICKET, null, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(tickets);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public async getObjectList(reload: boolean = false): Promise<KIXObject[]> {
        if (reload) {
            await this.loadTickets();
        }
        return await super.getObjectList();
    }

    public reset(): void {
        super.reset();
        this.queueId = null;
    }

}
