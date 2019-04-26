import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, SystemAddressProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('communication-system-addresses-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: E-mail',
            [
                'communication-admin-system-addresses-create', 'communication-admin-system-addresses-table-delete'
            ],
            new TableWidgetSettings(KIXObjectType.SYSTEM_ADDRESS,
                [SystemAddressProperty.REALNAME, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
