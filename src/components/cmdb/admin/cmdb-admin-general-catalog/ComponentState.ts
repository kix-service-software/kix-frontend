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
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings
} from "../../../../core/model";
import { GeneralCatalogItemProperty } from "../../../../core/model/kix/general-catalog/GeneralCatalogItemProperty";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('cmdb-general-catalog-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Assets: General Catalog',
            [
                'cmdb-admin-general-catalog-create', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.GENERAL_CATALOG_ITEM,
                [GeneralCatalogItemProperty.NAME, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
