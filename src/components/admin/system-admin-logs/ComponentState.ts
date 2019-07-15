import { IdService } from "../../../core/browser";
import { WidgetConfiguration, TableWidgetSettings, KIXObjectType, SortOrder } from "../../../core/model";
import { LogFileProperty } from "../../../core/model/kix/log";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('system-admin-logs-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#System: Logs', [],
            new TableWidgetSettings(
                KIXObjectType.LOG_FILE,
                [LogFileProperty.MODIFIY_TIME, SortOrder.DOWN]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
