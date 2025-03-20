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
import { SortOrder } from '../../../../../model/SortOrder';
import { TextModuleProperty } from '../../../model/TextModuleProperty';


export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-ticket-text-modules-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Text Modules',
            [
                'text-module-create', 'text-module-duplicate', 'text-module-table-delete', 'text-module-csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.TEXT_MODULE, [TextModuleProperty.NAME, SortOrder.UP]
            ),
            false, false, 'kix-icon-gears')
    ) { }

}
