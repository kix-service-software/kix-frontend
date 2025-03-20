/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoleProperty } from '../../../model/RoleProperty';
import { SortOrder } from '../../../../../model/SortOrder';


export class ComponentState {

    public constructor(
        public instanceId: string = 'user-admin-roles',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#User Management: Roles',
            [
                'user-admin-role-create-action', 'user-admin-role-table-delete-action',
                'import-action', 'csv-export-action', 'user-admin-role-delete-action'
            ],
            null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.ROLE, [RoleProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
