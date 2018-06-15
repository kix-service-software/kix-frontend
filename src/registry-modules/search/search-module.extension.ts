import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration
} from '@kix/core/dist/model';
import { SearchContext, SearchContextConfiguration } from '@kix/core/dist/browser/search';

export class ModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return SearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new SearchContextConfiguration(SearchContext.CONTEXT_ID, [], [], [], [], []);
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
