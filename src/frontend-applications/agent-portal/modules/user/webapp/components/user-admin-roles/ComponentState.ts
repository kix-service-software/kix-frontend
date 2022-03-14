/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RoleProperty } from '../../../model/RoleProperty';
import { SortOrder } from '../../../../../model/SortOrder';


export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('user-admin-users'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#User Management: Roles',
            [
                'user-admin-role-create-action', 'user-admin-role-table-delete-action',
                'import-action', 'csv-export-action'
            ],
            null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.ROLE, [RoleProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
