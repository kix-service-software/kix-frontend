/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService, TableConfiguration, TableHeaderHeight, TableRowHeight } from "../../../core/browser";
import { WidgetConfiguration, TableWidgetSettings, KIXObjectType, JobProperty, SortOrder } from "../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('admin-jobs-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Automation: Jobs', ['csv-export-action'],
            new TableWidgetSettings(
                KIXObjectType.JOB, [JobProperty.NAME, SortOrder.UP],
                new TableConfiguration(
                    KIXObjectType.JOB, null, null, null, true, false, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
