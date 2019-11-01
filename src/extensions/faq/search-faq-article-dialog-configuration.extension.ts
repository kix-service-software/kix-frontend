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
    FormContext, SearchForm, ConfiguredWidget, WidgetConfiguration, CRUD, KIXObjectProperty,
    ConfiguredDialogWidget, ContextMode, HelpWidgetConfiguration
} from '../../core/model';
import { FAQArticleSearchContext } from '../../core/browser/faq';
import { FAQArticleProperty } from '../../core/model/kix/faq';
import { ConfigurationService } from '../../core/services';
import { SearchProperty } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { ConfigurationType, ConfigurationDefinition } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class ModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQArticleSearchContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const helpConfig = new HelpWidgetConfiguration(
            'faq-article-search-dialog-help-widget-config', 'Help COnfig', ConfigurationType.HelpWidget,
            'Translatable#Helptext_Search_FAQArticle',
            [
                ['Translatable#How to search in KIX 18?', 'faqarticles/2']
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpConfig);

        const helpWidget = new WidgetConfiguration(
            'faq-article-search-dialog-help-widget', 'Help Widget', ConfigurationType.Widget,
            'help-widget', 'Translatable#Help', [],
            new ConfigurationDefinition('faq-article-search-dialog-help-widget-config', ConfigurationType.HelpWidget),
            null, false, false, 'kix-icon-query', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(helpWidget);

        const widget = new WidgetConfiguration(
            'faq-article-search-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'search-faq-article-dialog', 'Translatable#FAQ Search', [], null, null,
            false, false, 'kix-icon-search-faq'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget(
                    'faq-article-search-dialog-help-widget', 'faq-article-search-dialog-help-widget', null,
                    [new UIComponentPermission('faq/articles', [CRUD.READ])]
                )
            ],
            [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'faq-article-search-dialog-widget', 'faq-article-search-dialog-widget',
                    KIXObjectType.FAQ_ARTICLE, ContextMode.SEARCH
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'faq-article-search-form';
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new SearchForm(
                formId, 'FAQ-Artikel', KIXObjectType.FAQ_ARTICLE, FormContext.SEARCH,
                null,
                [
                    SearchProperty.FULLTEXT,
                    FAQArticleProperty.TITLE, FAQArticleProperty.CATEGORY_ID,
                    KIXObjectProperty.VALID_ID
                ]
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new ModuleExtension();
};
