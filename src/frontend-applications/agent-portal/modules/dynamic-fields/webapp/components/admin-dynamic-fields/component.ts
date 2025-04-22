/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { DynamicFieldService } from '../../core/DynamicFieldService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../model/DynamicFieldProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { TableHeaderHeight } from '../../../../table/model/TableHeaderHeight';
import { TableRowHeight } from '../../../../table/model/TableRowHeight';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const ignoreTypes = DynamicFieldService.getInstance().ignoreDFTypes;

        const tableWidgetConfiguration = new TableWidgetConfiguration(null, null, null, KIXObjectType.DYNAMIC_FIELD);
        if (ignoreTypes?.length > 0) {
            const tableConfig = new TableConfiguration(null, null, null, KIXObjectType.DYNAMIC_FIELD);
            tableConfig.headerHeight = TableHeaderHeight.LARGE;
            tableConfig.rowHeight = TableRowHeight.LARGE;
            tableConfig.loadingOptions = new KIXObjectLoadingOptions([]);
            for (const ignoreType of ignoreTypes) {
                tableConfig.loadingOptions.filter.push(
                    new FilterCriteria(
                        DynamicFieldProperty.FIELD_TYPE, SearchOperator.NOT_EQUALS,
                        FilterDataType.STRING, FilterType.AND, ignoreType
                    )
                );
            }
            tableWidgetConfiguration.configuration = tableConfig;
        }

        this.state.widgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#System: Dynamic Fields',
            [
                'dynamic-field-create-action', 'dynamic-field-duplicate-action',
                'dynamic-field-delete-action', 'csv-export-action'
            ], null, tableWidgetConfiguration,
            false, false, 'kix-icon-gears'
        );
    }

}

module.exports = Component;
