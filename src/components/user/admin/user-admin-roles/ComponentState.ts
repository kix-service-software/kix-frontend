import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, TableWidgetSettings, KIXObjectType, RoleProperty, SortOrder
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('user-admin-users'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#User Management: Roles', [
                'user-admin-role-create-action', 'user-admin-role-table-delete-action',
                'import-action', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.ROLE, [RoleProperty.NAME, SortOrder.UP]), false, false, null,
            'kix-icon-gear'
        )
    ) { }

}
