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
import { TicketTypeProperty } from '../../../model/TicketTypeProperty';
import { SortOrder } from '../../../../../model/SortOrder';

export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-ticket-types-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Types',
            [
                'ticket-admin-type-create', 'ticket-admin-type-table-delete', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.TICKET_TYPE,
                [TicketTypeProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears')
    ) { }

}
