/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { NotificationProperty } from '../../../model/NotificationProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';


export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-notifications-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            null, null, null,
            'table-widget', 'Translatable#Automation: Notifications', ['notification-create', 'notification-table-delete', 'csv-export-action'],
            null, new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.NOTIFICATION, [NotificationProperty.NAME, SortOrder.UP], null,
                new TableConfiguration(
                    null, null, null,
                    KIXObjectType.NOTIFICATION, null, null, null, [], true, false, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
