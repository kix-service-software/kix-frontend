/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { QueueProperty } from '../../../model/QueueProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';


export class ComponentState {

    public constructor(
        public instanceId: string = 'admin-ticket-queues-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Ticket: Queues',
            [
                'ticket-admin-queue-create', 'ticket-admin-queue-duplicate', 'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null,
                KIXObjectType.QUEUE, [QueueProperty.NAME, SortOrder.UP], null,
                new TableConfiguration(null, null, null,
                    KIXObjectType.QUEUE,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, null
                            ),
                        ], null, null,
                        [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES]
                    ), null, null, [], true, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears')
    ) { }

}
