/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { TableHeaderHeight } from '../table/model/TableHeaderHeight';
import { TableRowHeight } from '../table/model/TableRowHeight';
import { ConfigItemSearchContext } from './webapp/core';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ConfigItemSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const tableConfig = new TableConfiguration(
            'cmdb-search-table-config', 'CMDB Table Configuration', ConfigurationType.Table,
            KIXObjectType.CONFIG_ITEM, null, null, null, [], true, true, null, null, TableHeaderHeight.LARGE,
            TableRowHeight.LARGE
        );

        const tableWidgetConfig = new TableWidgetConfiguration(
            'cmdb-search-ci-table-widget', 'CI Search Table Widget', ConfigurationType.TableWidget,
            KIXObjectType.CONFIG_ITEM, null, null, tableConfig
        );
        tableWidgetConfig.showFilter = false;

        const ciListWidget = new WidgetConfiguration(
            'cmdb-search-ci-list-widget', 'CI Search List', ConfigurationType.Widget,
            'table-widget', 'Translatable#Search Results: Config Items',
            ['bulk-action', 'csv-export-action'],
            null, tableWidgetConfig, false, false, 'kix-icon-ci', true
        );

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Config Item Search', ConfigurationType.Context, this.getModuleId(),
                [], [], [],
                [
                    new ConfiguredWidget(
                        'search-criteria-widget', null, new WidgetConfiguration(
                            'search-criteria-widget', 'Search Criteria Widget', ConfigurationType.Widget,
                            'search-criteria-widget', 'Translatable#Selected Search Criteria', [], null, null, false
                        )
                    ),
                    new ConfiguredWidget('cmdb-search-ci-list-widget', null, ciListWidget)
                ], undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                [
                    [KIXObjectType.CONFIG_ITEM, 'cmdb-search-ci-list-widget']
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
