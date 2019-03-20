import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, WidgetSize, ConfiguredWidget, WidgetConfiguration
} from '../../core/model';
import { FAQArticleSearchContext, FAQArticleSearchContextConfiguration } from '../../core/browser/faq';
import { FAQArticleProperty } from '../../core/model/kix/faq';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget', new WidgetConfiguration(
            'help-widget', 'Translatable#Help', [], {
                // tslint:disable-next-line:max-line-length
                helpText: 'Translatable#The FAQ article <a href=\"faqarticles/2\" target=\"_blank\">How to search in KIX 18?</a> offers a detailed <b>explanation for the search operators<b>'
            }, false, false, WidgetSize.BOTH, 'kix-icon-query', false
        ));
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new FAQArticleSearchContextConfiguration(
            FAQArticleSearchContext.CONTEXT_ID, [], sidebars, sidebarWidgets, [], []
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-faq-article-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'FAQ-Artikel',
                KIXObjectType.FAQ_ARTICLE,
                FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT,
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
