/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NewFAQArticleDialogContext } from './webapp/core';
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
import { ModuleConfigurationService } from '../../server/services/configuration';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQArticleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'faq-article-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New FAQ', [], null, null,
            false, false, 'kix-icon-new-faq'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'faq-article-new-dialog-widget', 'faq-article-new-dialog-widget',
                        KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'faq-article-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-title',
                'Translatable#Title', FAQArticleProperty.TITLE, null, true,
                'Translatable#Helptext_FAQ_ArticleCreate_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-category',
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
                'faq-article-new-form-field-customer-visible',
                'Translatable#Show in Customer Portal',
                FAQArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_CustomerVisible'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-language',
                'Translatable#Language', FAQArticleProperty.LANGUAGE, 'language-input', true,
                'Translatable#Helptext_FAQ_ArticleCreate_Language',
                null, new FormFieldValue('de')
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-tags',
                'Translatable#Tags', FAQArticleProperty.KEYWORDS, null, false,
                'Translatable#Helptext_FAQ_ArticleCreate_Tags'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-attachments',
                'Translatable#Attachments', FAQArticleProperty.ATTACHMENTS, 'attachment-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Attachments'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-symptom',
                'Translatable#Symptom', FAQArticleProperty.FIELD_1, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Symptom'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-cause',
                'Translatable#Cause', FAQArticleProperty.FIELD_2, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Cause'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-solution',
                'Translatable#Solution', FAQArticleProperty.FIELD_3, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Solution'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-article-new-form-field-comment',
                'Translatable#Comment', FAQArticleProperty.FIELD_6, 'rich-text-input', false,
                'Translatable#Helptext_FAQ_ArticleCreate_Comment'
            )
        );
        configurations.push(
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

        configurations.push(
            new FormGroupConfiguration(
                'faq-article-new-form-group-data', 'Translatable#FAQ Data',
                [
                    'faq-article-new-form-field-title',
                    'faq-article-new-form-field-category',
                    'faq-article-new-form-field-customer-visible',
                    'faq-article-new-form-field-language',
                    'faq-article-new-form-field-tags',
                    'faq-article-new-form-field-relatedassets',
                    'faq-article-new-form-field-attachments',
                    'faq-article-new-form-field-symptom',
                    'faq-article-new-form-field-cause',
                    'faq-article-new-form-field-solution',
                    'faq-article-new-form-field-comment',
                    'faq-article-new-form-field-valid'
                ], null,
                [
                    new FormFieldConfiguration(
                        'faq-article-new-form-field-relatedassets', null, KIXObjectProperty.DYNAMIC_FIELDS, null,
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
                'faq-article-new-form-page', 'Translatable#New FAQ',
                ['faq-article-new-form-group-data']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New FAQ',
                ['faq-article-new-form-page'],
                KIXObjectType.FAQ_ARTICLE
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
