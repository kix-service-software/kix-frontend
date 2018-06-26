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

        return new SearchContextConfiguration(this.getModuleId(), explorer, [], [], explorerWidgets, []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
