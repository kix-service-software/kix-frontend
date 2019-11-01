/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetConfiguration, KIXObjectType, TicketTypeProperty, SortOrder, TableWidgetConfiguration
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-types-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Types',
            [
                'ticket-admin-type-create', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.TICKET_TYPE,
                [TicketTypeProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears')
    ) { }

}
