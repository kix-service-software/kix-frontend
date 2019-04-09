import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings, TicketStateProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-states-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: State',
            [
                'ticket-admin-state-create', 'ticket-admin-state-table-delete',
                'ticket-admin-state-import', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.TICKET_STATE,
                [TicketStateProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
