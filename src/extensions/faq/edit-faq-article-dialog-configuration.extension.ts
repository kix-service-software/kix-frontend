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
    FormFieldValue, KIXObjectProperty, ObjectReferenceOptions, FormFieldOption,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, WidgetConfiguration,
    ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { FAQArticleProperty, FAQCategoryProperty } from '../../core/model/kix/faq';
import { EditFAQArticleDialogContext } from '../../core/browser/faq';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditFAQArticleDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'faq-article-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-faq-article-dialog', 'Translatable#Edit FAQ Article', [], null, null, false,
            false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'faq-article-edit-dialog-widget', 'faq-article-edit-dialog-widget',
                    KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'faq-article-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, true,
                'Translatable#Helptext_FAQ_ArticleCreate_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-category',
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
                'faq-article-edit-form-field-language',
                'Translatable#Language', FAQArticleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Language',
                null, new FormFieldValue('de')
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-tags',
                'Translatable#Tags', FAQArticleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_FAQ_ArticleCreate_Tags'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-attachments',
                'Translatable#Attachments', FAQArticleProperty.ATTACHMENTS, 'attachment-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Attachments'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-links',
                'Link FAQ with', FAQArticleProperty.LINK, 'link-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Links'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-symptom',
                'Translatable#Symptom', FAQArticleProperty.FIELD_1, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Symptom'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-cause',
                'Translatable#Cause', FAQArticleProperty.FIELD_2, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Cause'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-solution',
                'Translatable#Solution', FAQArticleProperty.FIELD_3, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Solution'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-comment',
                'Translatable#Comment', FAQArticleProperty.FIELD_6, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Comment'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-valid',
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
                'faq-article-edit-form-group-data', 'Translatable#FAQ Data',
                [
                    'faq-article-edit-form-field-title',
                    'faq-article-edit-form-field-category',
                    'faq-article-edit-form-field-language',
                    'faq-article-edit-form-field-tags',
                    'faq-article-edit-form-field-attachments',
                    'faq-article-edit-form-field-links',
                    'faq-article-edit-form-field-symptom',
                    'faq-article-edit-form-field-cause',
                    'faq-article-edit-form-field-solution',
                    'faq-article-edit-form-field-comment',
                    'faq-article-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit FAQ',
                [
                    'faq-article-edit-form-group-data'
                ],
                KIXObjectType.FAQ_ARTICLE, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.FAQ_ARTICLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
