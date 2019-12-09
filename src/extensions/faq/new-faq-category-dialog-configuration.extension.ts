/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    FormFieldOption, ContextConfiguration, FormFieldValue,
    KIXObjectType, FormContext, KIXObjectProperty,
    ObjectReferenceOptions, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType,
    ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import { FAQCategoryProperty } from '../../core/model/kix/faq';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { NewFAQCategoryDialogContext } from '../../core/browser/faq/admin';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQCategoryDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'faq-category-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-faq-category-dialog', 'Translatable#New Category', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'faq-category-new-dialog-widget', 'faq-category-new-dialog-widget',
                        KIXObjectType.FAQ_CATEGORY, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'faq-category-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'faq-category-new-form-field-name',
                'Translatable#Name', FAQCategoryProperty.NAME, null, true,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-category-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Icon'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-category-new-form-field-parent',
                'Translatable#Parent Category', FAQCategoryProperty.PARENT_ID, 'object-reference-input', false,
                'Translatable#Helptext_Admin_FAQCategoryCreate_ParentCategory',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
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
                'faq-category-new-form-field-comment',
                'Translatable#Comment', FAQCategoryProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Comment',
                null, null, null, null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'faq-category-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_FAQCategoryCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'faq-category-new-form-group-information', 'Translatable#FAQ Category Information',
                [
                    'faq-category-new-form-field-name',
                    'faq-category-new-form-field-icon',
                    'faq-category-new-form-field-parent',
                    'faq-category-new-form-field-comment',
                    'faq-category-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'faq-category-new-form-page', 'Translatable#New FAQ Category',
                ['faq-category-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New FAQ Category',
                ['faq-category-new-form-page'],
                KIXObjectType.FAQ_CATEGORY, true
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.FAQ_CATEGORY, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
