/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ImportExportTemplateProperty } from '../../../model/ImportExportTemplateProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterType } from '../../../../../model/FilterType';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { TableHeaderHeight } from '../../../../table/model/TableHeaderHeight';
import { TableRowHeight } from '../../../../table/model/TableRowHeight';

export class ComponentState {
    public constructor(
        public instanceId: string = 'admin-assets-import-export-templates-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Assets: Import/Export',
            ['template-import-action', 'template-export-action'], null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.IMPORT_EXPORT_TEMPLATE,
                [ImportExportTemplateProperty.NAME, SortOrder.UP], undefined,
                new TableConfiguration(null, null, null,
                    KIXObjectType.IMPORT_EXPORT_TEMPLATE,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                ImportExportTemplateProperty.OBJECT, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.AND, 'ITSMConfigItem'
                            )
                        ], null, undefined,
                        [ImportExportTemplateProperty.RUNS, ImportExportTemplateProperty.OBJECT_DATA]
                    ),
                    null, null, [], true, true, null, null,
                    TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
