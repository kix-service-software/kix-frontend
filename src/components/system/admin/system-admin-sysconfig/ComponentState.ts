import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, SysConfigProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('system-sysconfig-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: Email',
            [
            ],
            new TableWidgetSettings(KIXObjectType.SYS_CONFIG_ITEM,
                [SysConfigProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
