import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm
} from '@kix/core/dist/model';
import { ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import { FAQArticleSearchContext, FAQArticleSearchContextConfiguration } from '@kix/core/dist/browser/faq';
import { FAQArticleProperty } from '@kix/core/dist/model/kix/faq';

export class ModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new FAQArticleSearchContextConfiguration(FAQArticleSearchContext.CONTEXT_ID, [], [], [], [], []);
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'search-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const form = new SearchForm(
                formId,
                'FAQ-Artikel',
                KIXObjectType.FAQ_ARTICLE,
                FormContext.SEARCH,
                null,
                true,
                [
                    FAQArticleProperty.TITLE, FAQArticleProperty.CATEGORY_ID
                ]
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
