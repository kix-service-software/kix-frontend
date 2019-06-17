import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings, TicketTemplateProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-templates-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: Templates',
            [
                'ticket-admin-template-create', 'ticket-admin-template-table-delete'
            ],
            new TableWidgetSettings(KIXObjectType.TICKET_TEMPLATE,
                [TicketTemplateProperty.NAME, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
