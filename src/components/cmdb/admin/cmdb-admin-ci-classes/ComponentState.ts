import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, ConfigItemClassProperty, TableWidgetSettings
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('cmdb-ci-classes-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Core Data: CI Class',
            [
                'cmdb-admin-ci-class-create', 'cmdb-admin-ci-class-import', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.CONFIG_ITEM_CLASS,
                [ConfigItemClassProperty.NAME, SortOrder.UP]), false, false, null, 'kix-icon-gear')
    ) { }

}
