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
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { NewFAQCategoryDialogContext } from '../../core/browser/faq/admin';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQCategoryDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'faq-category-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-faq-category-dialog', 'Translatable#New Category', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'faq-category-new-dialog-widget', 'faq-category-new-dialog-widget',
                    KIXObjectType.FAQ_CATEGORY, ContextMode.CREATE_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'faq-category-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-category-new-form-field-name',
                'Translatable#Name', FAQCategoryProperty.NAME, null, true,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-category-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Icon'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'faq-category-new-form-field-comment',
                'Translatable#Comment', FAQCategoryProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_FAQCategoryCreate_Comment',
                null, null, null, null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New FAQ Category',
                [
                    'faq-category-new-form-group-information'
                ],
                KIXObjectType.FAQ_CATEGORY, true
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.FAQ_CATEGORY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
