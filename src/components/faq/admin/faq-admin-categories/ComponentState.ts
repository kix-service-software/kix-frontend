/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IdService, TableConfiguration, SearchOperator, TableHeaderHeight, TableRowHeight
} from "../../../../core/browser";
import {
    WidgetConfiguration, TableWidgetSettings, KIXObjectType,
    SortOrder, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType
} from "../../../../core/model";
import { FAQCategoryProperty } from "../../../../core/model/kix/faq";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('faq-admin-categories'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Knowledge Database: FAQ Categories',
            ['faq-admin-category-create-action', 'faq-category-csv-export-action'],
            new TableWidgetSettings(
                KIXObjectType.FAQ_CATEGORY, [FAQCategoryProperty.NAME, SortOrder.UP],
                new TableConfiguration(
                    KIXObjectType.FAQ_CATEGORY,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, null
                            )
                        ], null, null,
                        [FAQCategoryProperty.SUB_CATEGORIES], [FAQCategoryProperty.SUB_CATEGORIES]
                    ), null, null, true, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
