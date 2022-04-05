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
import { TicketPriorityProperty } from '../../../model/TicketPriorityProperty';
import { SortOrder } from '../../../../../model/SortOrder';


export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-ticket-priorities-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Priorities',
            [
                'ticket-admin-priority-create', 'ticket-admin-priority-table-delete', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.TICKET_PRIORITY,
                [TicketPriorityProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears')
    ) { }

}
