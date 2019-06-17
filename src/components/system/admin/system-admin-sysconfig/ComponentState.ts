import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, SysConfigOptionProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('system-sysconfig-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#System: SysConfig',
            [
            ],
            new TableWidgetSettings(KIXObjectType.SYS_CONFIG_OPTION,
                [SysConfigOptionProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
