/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { EditFAQArticleDialogContext } from './webapp/core';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { FAQArticleProperty } from './model/FAQArticleProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FAQCategoryProperty } from './model/FAQCategoryProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditFAQArticleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'faq-article-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit FAQ Article', [], null, null, false,
            false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'faq-article-edit-dialog-widget', 'faq-article-edit-dialog-widget',
                        KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'faq-article-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, true,
                'Translatable#Helptext_FAQ_ArticleCreate_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-category',
                'Translatable#Category', FAQArticleProperty.CATEGORY_ID, 'object-reference-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Category',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
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
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-customer-visible',
                'Translatable#Show in Customer Portal',
                FAQArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_CustomerVisible'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-language',
                'Translatable#Language', FAQArticleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Language',
                null, new FormFieldValue('de')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-tags',
                'Translatable#Tags', FAQArticleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_FAQ_ArticleCreate_Tags'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-attachments',
                'Translatable#Attachments', FAQArticleProperty.ATTACHMENTS, 'attachment-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Attachments'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-symptom',
                'Translatable#Symptom', FAQArticleProperty.FIELD_1, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Symptom'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-cause',
                'Translatable#Cause', FAQArticleProperty.FIELD_2, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Cause'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-solution',
                'Translatable#Solution', FAQArticleProperty.FIELD_3, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Solution'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-edit-form-field-comment',
                'Translatable#Comment', FAQArticleProperty.FIELD_6, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Comment'
            )
        );
        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'faq-article-edit-form-group-data', 'Translatable#FAQ Data',
                [
                    'faq-article-edit-form-field-title',
                    'faq-article-edit-form-field-category',
                    'faq-article-edit-form-field-customer-visible',
                    'faq-article-edit-form-field-language',
                    'faq-article-edit-form-field-tags',
                    'faq-article-edit-form-field-relatedassets',
                    'faq-article-edit-form-field-attachments',
                    'faq-article-edit-form-field-symptom',
                    'faq-article-edit-form-field-cause',
                    'faq-article-edit-form-field-solution',
                    'faq-article-edit-form-field-comment',
                    'faq-article-edit-form-field-valid'
                ], null,
                [
                    new FormFieldConfiguration(
                        'faq-article-edit-form-field-relatedassets', null, KIXObjectProperty.DYNAMIC_FIELDS, null,
                        false, 'Translatable#Helptext_FAQ_ArticleCreate_RelatedAssets',
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'RelatedAssets')
                        ]
                    )
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'faq-article-edit-form-page', 'Translatable#Edit FAQ',
                ['faq-article-edit-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit FAQ',
                ['faq-article-edit-form-page'],
                KIXObjectType.FAQ_ARTICLE, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.FAQ_ARTICLE, formId);
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
