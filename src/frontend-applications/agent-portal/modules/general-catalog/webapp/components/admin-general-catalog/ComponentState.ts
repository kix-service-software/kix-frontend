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
import { GeneralCatalogItemProperty } from '../../../model/GeneralCatalogItemProperty';
import { SortOrder } from '../../../../../model/SortOrder';

export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-general-catalog-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Assets: General Catalog',
            [
                'admin-general-catalog-create', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.GENERAL_CATALOG_ITEM,
                [GeneralCatalogItemProperty.NAME, SortOrder.UP],
                undefined, undefined, undefined, false
            ), false, false, 'kix-icon-gears')
    ) { }

}
