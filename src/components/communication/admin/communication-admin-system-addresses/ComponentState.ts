import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, SystemAddressProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-states-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: E-mail-addresses',
            [],
            new TableWidgetSettings(KIXObjectType.SYSTEM_ADDRESS,
                [SystemAddressProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
