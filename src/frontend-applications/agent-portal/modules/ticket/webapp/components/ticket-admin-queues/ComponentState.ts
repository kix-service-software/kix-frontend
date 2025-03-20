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
import { QueueProperty } from '../../../model/QueueProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';

export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-ticket-queues-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Queues',
            [
                'ticket-admin-queue-create', 'ticket-admin-queue-duplicate', 'csv-export-action',
                'ticket-admin-queue-delete'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.QUEUE, [QueueProperty.NAME, SortOrder.UP], null,
                new TableConfiguration(null, null, null,
                    KIXObjectType.QUEUE, null, null, null, [], true, null, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears')
    ) { }

}
