/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { TableHeaderHeight, TableRowHeight } from "../../../../base-components/webapp/core/table";
import { IdService } from "../../../../../model/IdService";
import { WidgetConfiguration } from "../../../../../model/configuration/WidgetConfiguration";
import { TableWidgetConfiguration } from "../../../../../model/configuration/TableWidgetConfiguration";
import { TableConfiguration } from "../../../../../model/configuration/TableConfiguration";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('admin-dynamic-fields'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#System: Dynamic Fields',
            ['dynamic-field-create-action', 'csv-export-action'], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.DYNAMIC_FIELD, null, null,
                new TableConfiguration(null, null, null,
                    KIXObjectType.DYNAMIC_FIELD, null, null, null, [], true, null, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
