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
    WidgetConfiguration, KIXObjectType, SortOrder, ConfigItemClassProperty, TableWidgetConfiguration
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('cmdb-ci-classes-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#CMDB: CI Classes',
            [
                'cmdb-admin-ci-class-create', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.CONFIG_ITEM_CLASS,
                [ConfigItemClassProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears')
    ) { }

}
