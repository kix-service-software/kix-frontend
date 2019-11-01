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
    KIXObjectType, FormContext, ContextConfiguration,
    KIXObjectProperty, GeneralCatalogItemProperty, ObjectReferenceOptions, FormFieldOption,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, WidgetConfiguration,
    ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { EditGeneralCatalogDialogContext } from '../../core/browser/general-catalog';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditGeneralCatalogDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const widget = new WidgetConfiguration(
            'general-catalog-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-general-catalog-dialog', 'Translatable#Edit Value', [],
            null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'general-catalog-edit-dialog-widget', 'general-catalog-edit-dialog-widget',
                    KIXObjectType.GENERAL_CATALOG_ITEM, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'general-catalog-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-class',
                'Translatable#Class', GeneralCatalogItemProperty.CLASS, 'object-reference-input', true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Class', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_CLASS),

                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ], null, null,
                null, null, null, null, 100
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-name',
                'Translatable#Name', GeneralCatalogItemProperty.NAME, null, true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Name', null, null, null,
                null, null, null, null, 100
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_GeneralCatalogCreate_Icon.'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Comment', null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_GeneralCatalogCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'general-catalog-edit-form-group-information', 'Translatable#General Catalog',
                [
                    'general-catalog-edit-form-field-class',
                    'general-catalog-edit-form-field-name',
                    'general-catalog-edit-form-field-icon',
                    'general-catalog-edit-form-field-comment',
                    'general-catalog-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Value',
                [
                    'general-catalog-edit-form-group-information'
                ],
                KIXObjectType.GENERAL_CATALOG_ITEM, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.GENERAL_CATALOG_ITEM, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
