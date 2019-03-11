import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration
} from '../../core/model';
import { SearchContext, SearchContextConfiguration } from '../../core/browser/search/context';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return SearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        // explorer
        const searchResultExplorer =
            new ConfiguredWidget("20180625-search-result-explorer", new WidgetConfiguration(
                "search-result-explorer", "Search Results", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search', false)
            );

        const explorer = ['20180625-search-result-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [searchResultExplorer];

        const searchResultListWidget =
            new ConfiguredWidget("201800709-search-result-list-widget", new WidgetConfiguration(
                "search-result-list-widget", "Hit List", [
                    'csv-export-action', 'bulk-action', 'search-result-print-action'
                ], {},
                false, true, WidgetSize.LARGE, null, true)
            );

        const content: string[] = ['201800709-search-result-list-widget'];
        const contentWidgets = [searchResultListWidget];

        return new SearchContextConfiguration(
            this.getModuleId(),
            explorer,
            [],
            [],
            explorerWidgets,
            content,
            contentWidgets,
            []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
