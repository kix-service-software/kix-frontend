import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TicketPriorityProperty, TableWidgetSettings
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-priorities-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Core Data: Priorities',
            [
                'ticket-admin-priority-create', 'ticket-admin-priority-table-delete',
                'ticket-admin-priority-import', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.TICKET_PRIORITY,
                [TicketPriorityProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gear')
    ) { }

}
