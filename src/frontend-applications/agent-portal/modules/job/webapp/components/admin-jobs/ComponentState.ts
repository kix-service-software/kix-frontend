/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from "../../../../../model/IdService";
import { WidgetConfiguration } from "../../../../../model/configuration/WidgetConfiguration";
import { TableWidgetConfiguration } from "../../../../../model/configuration/TableWidgetConfiguration";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { JobProperty } from "../../../model/JobProperty";
import { SortOrder } from "../../../../../model/SortOrder";
import { TableConfiguration } from "../../../../../model/configuration/TableConfiguration";
import { TableHeaderHeight } from "../../../../../model/configuration/TableHeaderHeight";
import { TableRowHeight } from "../../../../../model/configuration/TableRowHeight";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('admin-jobs-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            null, null, null,
            'table-widget', 'Translatable#Automation: Jobs', ['job-create-action', 'csv-export-action'], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.JOB, [JobProperty.NAME, SortOrder.UP], null,
                new TableConfiguration(
                    null, null, null,
                    KIXObjectType.JOB, null, null, null, null, true, false, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
