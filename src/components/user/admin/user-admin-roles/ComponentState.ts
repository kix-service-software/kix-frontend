/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
            new TableWidgetSettings(KIXObjectType.ROLE, [RoleProperty.NAME, SortOrder.UP]), false, false,
            'kix-icon-gears'
        )
    ) { }

}
