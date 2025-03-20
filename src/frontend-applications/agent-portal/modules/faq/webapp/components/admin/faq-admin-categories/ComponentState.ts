/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FAQCategoryProperty } from '../../../../model/FAQCategoryProperty';
import { SortOrder } from '../../../../../../model/SortOrder';
import { TableConfiguration } from '../../../../../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { TableHeaderHeight } from '../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../model/configuration/TableRowHeight';

export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-faq-admin-categories',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Knowledge Database: FAQ Categories',
            [
                'faq-admin-category-create-action', 'faq-admin-category-delete-action',
                'faq-category-csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.FAQ_CATEGORY, [FAQCategoryProperty.NAME, SortOrder.UP], null,
                new TableConfiguration(null, null, null,
                    KIXObjectType.FAQ_CATEGORY,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, null
                            )
                        ], null, null,
                        [FAQCategoryProperty.SUB_CATEGORIES], [FAQCategoryProperty.SUB_CATEGORIES]
                    ), null, null, [], true, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
