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
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetConfiguration, TicketTemplateProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-templates-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Templates',
            [
                'ticket-admin-template-create', 'ticket-admin-template-table-delete'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.TICKET_TEMPLATE,
                [TicketTemplateProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears')
    ) { }

}
