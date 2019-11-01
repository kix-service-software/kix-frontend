/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from "../../../core/browser";
import { WidgetConfiguration, TableWidgetConfiguration, KIXObjectType, SortOrder } from "../../../core/model";
import { LogFileProperty } from "../../../core/model/kix/log";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('system-admin-logs-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#System: Logs', [], null,
            new TableWidgetConfiguration(null, null, null,
                KIXObjectType.LOG_FILE,
                [LogFileProperty.MODIFIY_TIME, SortOrder.DOWN]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
