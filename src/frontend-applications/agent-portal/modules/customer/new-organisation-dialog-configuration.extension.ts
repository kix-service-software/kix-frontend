/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { OrganisationProperty } from './model/OrganisationProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { DynamicFormFieldOption } from '../dynamic-fields/webapp/core';
import { NewOrganisationDialogContext } from './webapp/core/context/NewOrganisationDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewOrganisationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'organisation-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Organisation', [], null, null,
            false, false, 'kix-icon-man-house-new'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'organisation-new-dialog-widget', 'organisation-new-dialog-widget',
                        KIXObjectType.ORGANISATION, ContextMode.CREATE
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {

        const formId = 'organisation-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-cno',
                'Translatable#CNO', OrganisationProperty.NUMBER, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Number'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-name',
                'Translatable#Name', OrganisationProperty.NAME, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Name'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-type', null, KIXObjectProperty.DYNAMIC_FIELDS, null,
                false, 'Translatable#Helptext_Customers_OrganisationCreate_Type',
                [
                    new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'Type')
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-url',
                'Translatable#URL', OrganisationProperty.URL, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_URL'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'organisation-new-form-group-information', 'Translatable#Organisation Information',
                [
                    'organisation-new-form-field-cno',
                    'organisation-new-form-field-name',
                    'organisation-new-form-field-type',
                    'organisation-new-form-field-url'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-street',
                'Translatable#Street', OrganisationProperty.STREET, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Street'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-zip',
                'Translatable#Zip', OrganisationProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Zip'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-city',
                'Translatable#City', OrganisationProperty.CITY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_City'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-country',
                'Translatable#Country', OrganisationProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Country'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'organisation-new-form-group-address', 'Translatable#Postal Address',
                [
                    'organisation-new-form-field-street',
                    'organisation-new-form-field-zip',
                    'organisation-new-form-field-city',
                    'organisation-new-form-field-country'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-icon',
                'Translatable#Avatar', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Customers_OrganisationCreate_Avatar.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-comment',
                'Translatable#Comment', OrganisationProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_OrganisationCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'organisation-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Customers_OrganisationCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'organisation-new-form-group-other', 'Translatable#Other',
                [
                    'organisation-new-form-field-icon',
                    'organisation-new-form-field-comment',
                    'organisation-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'organisation-new-form-page', 'Translatable#New Organisation',
                [
                    'organisation-new-form-group-information',
                    'organisation-new-form-group-address',
                    'organisation-new-form-group-other'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Organisation',
                ['organisation-new-form-page'],
                KIXObjectType.ORGANISATION
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.ORGANISATION, formId);
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
