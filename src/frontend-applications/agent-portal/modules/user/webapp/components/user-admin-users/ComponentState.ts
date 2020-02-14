/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { SortOrder } from "../../../../../model/SortOrder";
import { ContactProperty } from "../../../../customer/model/ContactProperty";
import { TableConfiguration } from "../../../../../model/configuration/TableConfiguration";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { UserProperty } from "../../../model/UserProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { TableRowHeight } from "../../../../../model/configuration/TableRowHeight";
import { TableHeaderHeight } from "../../../../../model/configuration/TableHeaderHeight";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('user-admin-users'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#User Management: Agents',
            ['user-admin-user-create-action', 'csv-export-action'], null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.USER, [ContactProperty.LASTNAME, SortOrder.UP],
                null,
                new TableConfiguration(
                    null, null, undefined, KIXObjectType.USER,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                UserProperty.IS_AGENT, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                FilterType.AND, 1
                            )
                        ], null, null, [UserProperty.PREFERENCES, UserProperty.CONTACT]
                    ), undefined, undefined, [], true, false, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ), false, false,
            'kix-icon-gears'
        )
    ) { }

}
