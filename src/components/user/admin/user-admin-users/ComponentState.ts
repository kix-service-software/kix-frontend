import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, UserProperty, SortOrder
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('user-admin-users'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#User Management: Agents',
            ['user-admin-user-create-action', 'csv-export-action'],
            new TableWidgetSettings(KIXObjectType.USER, [UserProperty.USER_LASTNAME, SortOrder.UP]), false, false, null,
            'kix-icon-gear'
        )
    ) { }

}
