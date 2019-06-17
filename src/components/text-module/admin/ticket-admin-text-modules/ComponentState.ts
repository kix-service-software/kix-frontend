import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings, TextModuleProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-text-modules-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: Text Modules',
            [
                'text-module-create', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.TEXT_MODULE, [TextModuleProperty.NAME, SortOrder.UP]),
            false, false, 'kix-icon-gears')
    ) { }

}
