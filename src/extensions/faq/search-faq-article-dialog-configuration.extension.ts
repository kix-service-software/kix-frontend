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
    ContextConfiguration, KIXObjectType,
    FormContext, SearchForm, ConfiguredWidget, WidgetConfiguration, CRUD, KIXObjectProperty
} from '../../core/model';
import { FAQArticleSearchContext } from '../../core/browser/faq';
import { FAQArticleProperty } from '../../core/model/kix/faq';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpWidget = new ConfiguredWidget('20180919-help-widget',
            new WidgetConfiguration(
                'help-widget', 'Translatable#Help', [], {
                    helpText: 'Translatable#Helptext_Search_FAQArticle',
                    links: [
                        ['Translatable#How to search in KIX 18?', 'faqarticles/2']
                    ]
                }, false, false, 'kix-icon-query', false
            ),
            [new UIComponentPermission('faq/articles', [CRUD.READ])]
        );
        const sidebarWidgets = [helpWidget];
        const sidebars = ['20180919-help-widget'];
        return new ContextConfiguration(
            FAQArticleSearchContext.CONTEXT_ID,
            sidebars, sidebarWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'search-faq-article-form';
        const existingForm = configurationService.getConfiguration(formId);
        if (!existingForm || overwrite) {
            const form = new SearchForm(
                formId,
                'FAQ-Artikel',
                KIXObjectType.FAQ_ARTICLE,
                FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT,
                    FAQArticleProperty.TITLE, FAQArticleProperty.CATEGORY_ID,
                    KIXObjectProperty.VALID_ID
                ]
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.SEARCH], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
