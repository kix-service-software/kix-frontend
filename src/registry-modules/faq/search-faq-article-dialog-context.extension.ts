import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, ContactProperty
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FAQArticleSearchContext, FAQArticleSearchContextConfiguration } from '@kix/core/dist/browser/faq';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new FAQArticleSearchContextConfiguration(FAQArticleSearchContext.CONTEXT_ID, [], [], [], [], []);
    }

    public async createFormDefinitions(): Promise<void> {
        // nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
