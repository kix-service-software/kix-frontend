import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetSize, WidgetConfiguration
} from '@kix/core/dist/model';
import { SearchContext, SearchContextConfiguration } from '@kix/core/dist/browser/search';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return SearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {

        // explorer
        const searchResultExplorer =
            new ConfiguredWidget("20180625-search-result-explorer", new WidgetConfiguration(
                "search-result-explorer", "Suchergebnisse", [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search', false)
            );

        const explorer = ['20180625-search-result-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [searchResultExplorer];

        const searchResultListWidget =
            new ConfiguredWidget("201800709-search-result-list-widget", new WidgetConfiguration(
                "search-result-list-widget", "Trefferliste", ['csv-export-action'], {},
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

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
