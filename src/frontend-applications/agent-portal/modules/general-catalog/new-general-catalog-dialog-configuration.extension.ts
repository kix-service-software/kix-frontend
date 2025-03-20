/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewGeneralCatalogDialogContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { GeneralCatalogItemProperty } from './model/GeneralCatalogItemProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';

import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';


import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewGeneralCatalogDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'general-catalog-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Value', [], null, null, false, false,
            'kix-icon-new-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'general-catalog-new-dialog-widget', 'general-catalog-new-dialog-widget',
                        KIXObjectType.GENERAL_CATALOG_ITEM, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], [],
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
                null, null, null, null, null, 100
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-new-form-field-name',
                'Translatable#Name', GeneralCatalogItemProperty.NAME, null, true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Name', null, null, null,
                null, null, null, null, null, 100
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
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.NEW], KIXObjectType.GENERAL_CATALOG_ITEM, formId
        );
        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
