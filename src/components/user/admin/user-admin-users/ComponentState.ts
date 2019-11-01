/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetConfiguration, KIXObjectType, TableWidgetConfiguration, UserProperty, SortOrder
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('user-admin-users'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#User Management: Agents',
            ['user-admin-user-create-action', 'csv-export-action'], null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.USER, [UserProperty.USER_LASTNAME, SortOrder.UP]
            ), false, false,
            'kix-icon-gears'
        )
    ) { }

}
