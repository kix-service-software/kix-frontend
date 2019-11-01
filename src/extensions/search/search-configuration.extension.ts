/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration
} from '../../core/model';
import { SearchContext } from '../../core/browser/search/context/SearchContext';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return SearchContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        // explorer
        const searchResultExplorer = new WidgetConfiguration(
            'search-dashboard-result-explorer', 'Search Explorer', ConfigurationType.Widget,
            'search-result-explorer', 'Translatable#Search Results', [], null, null,
            false, false, 'kix-icon-search', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(searchResultExplorer);


        const searchResultListWidget = new WidgetConfiguration(
            'search-dashboard-result-list-widget', 'Search Result List', ConfigurationType.Widget,
            'search-result-list-widget', 'Hit List',
            ['csv-export-action', 'bulk-action', 'print-action'],
            null, null, false, true, null, true
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(searchResultListWidget);

        return new ContextConfiguration(
            this.getModuleId(), 'Search Dashboard', ConfigurationType.Context,
            this.getModuleId(),
            [],
            [
                new ConfiguredWidget('search-dashboard-result-explorer', 'search-dashboard-result-explorer')
            ],
            [],
            [
                new ConfiguredWidget('search-dashboard-result-list-widget', 'search-dashboard-result-list-widget')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
