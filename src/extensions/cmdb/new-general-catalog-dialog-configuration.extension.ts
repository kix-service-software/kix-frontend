/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { NewGeneralCatalogDialogContext } from '../../core/browser/general-catalog';
import {
    ContextConfiguration, KIXObjectProperty, FormFieldValue,
    KIXObjectType, FormContext, GeneralCatalogItemProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, FilterType, FilterDataType, ConfiguredDialogWidget,
    ContextMode, WidgetConfiguration
} from '../../core/model';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewGeneralCatalogDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'general-catalog-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-general-catalog-dialog', 'Translatable#New Value', [], null, null, false, false,
            'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'general-catalog-new-dialog-widget', 'general-catalog-new-dialog-widget',
                        KIXObjectType.GENERAL_CATALOG_ITEM, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {

        const formId = 'general-catalog-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-class',
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
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(ObjectReferenceOptions.FREETEXT, true)
            ], null, null,
                null, null, null, null, 100
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-name',
                'Translatable#Name', GeneralCatalogItemProperty.NAME, null, true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Name', null, null, null,
                null, null, null, null, 100
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_GeneralCatalogCreate_Icon.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_GeneralCatalogCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'general-catalog-new-form-group-information', 'Translatable#General Catalog',
                [
                    'general-catalog-new-form-field-class',
                    'general-catalog-new-form-field-name',
                    'general-catalog-new-form-field-icon',
                    'general-catalog-new-form-field-comment',
                    'general-catalog-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'general-catalog-new-form-page', 'Translatable#New Value',
                ['general-catalog-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Value',
                ['general-catalog-new-form-page'],
                KIXObjectType.GENERAL_CATALOG_ITEM
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.GENERAL_CATALOG_ITEM, formId);
        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
