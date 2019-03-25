import {
    WidgetConfiguration, KIXObjectType, TicketTypeProperty, SortOrder, TableWidgetSettings
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-types-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Core Data: Types',
            [
                'ticket-admin-type-create', 'ticket-admin-type-table-delete',
                'ticket-admin-type-import', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.TICKET_TYPE,
                [TicketTypeProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gear')
    ) { }

}
