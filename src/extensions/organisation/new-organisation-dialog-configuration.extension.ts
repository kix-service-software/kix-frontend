/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, FormContext,
    KIXObjectType, OrganisationProperty, KIXObjectProperty, FormFieldValue, FormFieldOption,
    ObjectReferenceOptions, ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { NewOrganisationDialogContext } from '../../core/browser/organisation';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewOrganisationDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'organisation-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-organisation-dialog', 'Translatable#New Organisation', [], null, null,
            false, false, 'kix-icon-man-house-new'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'organisation-new-dialog-widget', 'organisation-new-dialog-widget',
                    KIXObjectType.ORGANISATION, ContextMode.CREATE
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'organisation-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-cno',
                'Translatable#CNO', OrganisationProperty.NUMBER, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Number'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-name',
                'Translatable#Name', OrganisationProperty.NAME, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-url',
                'Translatable#URL', OrganisationProperty.URL, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_URL'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'organisation-new-form-group-information', 'Translatable#Organisation Information',
                [
                    'organisation-new-form-field-cno',
                    'organisation-new-form-field-name',
                    'organisation-new-form-field-url'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-street',
                'Translatable#Street', OrganisationProperty.STREET, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Street'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-zip',
                'Translatable#Zip', OrganisationProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Zip'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-city',
                'Translatable#City', OrganisationProperty.CITY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_City'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-country',
                'Translatable#Country', OrganisationProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Country'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-new-form-field-comment',
                'Translatable#Comment', OrganisationProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_OrganisationCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'organisation-new-form-group-other', 'Translatable#Other',
                [
                    'organisation-new-form-field-comment',
                    'organisation-new-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'organisation-new-form-page', 'Translatable#New Organisation',
                [
                    'organisation-new-form-group-information',
                    'organisation-new-form-group-address',
                    'organisation-new-form-group-other'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Organisation',
                ['organisation-new-form-page'],
                KIXObjectType.ORGANISATION
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.ORGANISATION, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
