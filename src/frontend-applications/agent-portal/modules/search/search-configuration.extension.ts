/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { SearchContext } from './webapp/core/SearchContext';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return SearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        // explorer
        const searchResultExplorer = new WidgetConfiguration(
            'search-dashboard-result-explorer', 'Search Explorer', ConfigurationType.Widget,
            'search-result-explorer', 'Translatable#Search Results', [], null, null,
            false, true, 'kix-icon-search', false
        );
        configurations.push(searchResultExplorer);

        const searchResultListWidget = new WidgetConfiguration(
            'search-dashboard-result-list-widget', 'Search Result List', ConfigurationType.Widget,
            'search-result-list-widget', 'Hit List',
            ['csv-export-action', 'bulk-action', 'print-action'],
            null, null, false, true, null, true
        );
        configurations.push(searchResultListWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Search', ConfigurationType.Context,
                this.getModuleId(),
                [],
                [
                    new ConfiguredWidget('search-dashboard-result-explorer', 'search-dashboard-result-explorer')
                ],
                [],
                [
                    new ConfiguredWidget('search-dashboard-result-list-widget', 'search-dashboard-result-list-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
