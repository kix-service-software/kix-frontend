import { Context, WidgetType, WidgetConfiguration } from "../../../model";
import { TicketSearchContextConfiguration } from "./TicketSearchContextConfiguration";

export class TicketSearchContext extends Context<TicketSearchContextConfiguration> {

    public static CONTEXT_ID: string = 'search-ticket-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
