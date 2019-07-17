import { IdService, TableConfiguration, TableHeaderHeight, TableRowHeight } from "../../../../core/browser";
import {
    WidgetConfiguration, TableWidgetSettings, KIXObjectType, SortOrder, NotificationProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('admin-notifications-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Automation: Notifications', ['notification-create', 'csv-export-action'],
            new TableWidgetSettings(
                KIXObjectType.NOTIFICATION, [NotificationProperty.NAME, SortOrder.UP],
                new TableConfiguration(
                    KIXObjectType.NOTIFICATION, null, null, null, true, false, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
