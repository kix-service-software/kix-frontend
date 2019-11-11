/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, FormContext, KIXObjectType,
    FormFieldValue, KIXObjectProperty, ObjectReferenceOptions,
    FormFieldOption, KIXObjectLoadingOptions, FilterCriteria, FilterType,
    FilterDataType, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { FAQArticleProperty, FAQCategoryProperty } from '../../core/model/kix/faq';
import { NewFAQArticleDialogContext } from '../../core/browser/faq';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'faq-article-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-faq-article-dialog', 'Translatable#New FAQ', [], null, null,
            false, false, 'kix-icon-new-faq'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'faq-article-new-dialog-widget', 'faq-article-new-dialog-widget',
                    KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'faq-article-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, true,
                'Translatable#Helptext_FAQ_ArticleCreate_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-category',
                'Translatable#Category', FAQArticleProperty.CATEGORY_ID, 'object-reference-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Category',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                                    FilterType.AND, null
                                )
                            ],
                            null, null,
                            [FAQCategoryProperty.SUB_CATEGORIES],
                            [FAQCategoryProperty.SUB_CATEGORIES]
                        )
                    )
                ]
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-language',
                'Translatable#Language', FAQArticleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Language',
                null, new FormFieldValue('de')
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-tags',
                'Translatable#Tags', FAQArticleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_FAQ_ArticleCreate_Tags'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-attachments',
                'Translatable#Attachments', FAQArticleProperty.ATTACHMENTS, 'attachment-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Attachments'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-links',
                'Link FAQ with', FAQArticleProperty.LINK, 'link-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Links'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-symptom',
                'Translatable#Symptom', FAQArticleProperty.FIELD_1, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Symptom'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-cause',
                'Translatable#Cause', FAQArticleProperty.FIELD_2, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Cause'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-solution',
                'Translatable#Solution', FAQArticleProperty.FIELD_3, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Solution'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-comment',
                'Translatable#Comment', FAQArticleProperty.FIELD_6, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Comment'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_FAQ_ArticleCreate_Valid',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'faq-article-new-form-group-data', 'Translatable#FAQ Data',
                [
                    'faq-article-new-form-field-title',
                    'faq-article-new-form-field-category',
                    'faq-article-new-form-field-language',
                    'faq-article-new-form-field-tags',
                    'faq-article-new-form-field-attachments',
                    'faq-article-new-form-field-links',
                    'faq-article-new-form-field-symptom',
                    'faq-article-new-form-field-cause',
                    'faq-article-new-form-field-solution',
                    'faq-article-new-form-field-comment',
                    'faq-article-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'faq-article-new-form-page', 'Translatable#New FAQ',
                ['faq-article-new-form-group-data']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New FAQ',
                ['faq-article-new-form-page'],
                KIXObjectType.FAQ_ARTICLE
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
