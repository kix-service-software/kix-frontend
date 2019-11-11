/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../core/extensions";
import { ConfigurationService } from "../../core/services";
import { EditOrganisationDialogContext } from "../../core/browser/organisation";
import {
    ContextConfiguration, OrganisationProperty, KIXObjectProperty,
    KIXObjectType, FormContext, FormFieldOption, FormFieldValue,
    ObjectReferenceOptions, ConfiguredDialogWidget, WidgetConfiguration, ContextMode
} from "../../core/model";
import { ConfigurationType } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";
import {
    FormFieldConfiguration, FormGroupConfiguration, FormConfiguration, FormPageConfiguration
} from "../../core/model/components/form/configuration";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditOrganisationDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'organisation-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-organisation-dialog', 'Translatable#Edit Organisation', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'organisation-edit-dialog-widget', 'organisation-edit-dialog-widget',
                    KIXObjectType.ORGANISATION, ContextMode.EDIT
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'organisation-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-cno',
                'Translatable#CNO', OrganisationProperty.NUMBER, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Number'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-name',
                'Translatable#Name', OrganisationProperty.NAME, null, true,
                'Translatable#Helptext_Customers_OrganisationCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-url',
                'Translatable#URL', OrganisationProperty.URL, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_URL'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'organisation-edit-form-group-information', 'Translatable#Organisation Information',
                [
                    'organisation-edit-form-field-cno',
                    'organisation-edit-form-field-name',
                    'organisation-edit-form-field-url'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-street',
                'Translatable#Street', OrganisationProperty.STREET, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Street'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-zip',
                'Translatable#Zip', OrganisationProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Zip'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-city',
                'Translatable#City', OrganisationProperty.CITY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_City'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-country',
                'Translatable#Country', OrganisationProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_OrganisationCreate_Country'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'organisation-edit-form-group-address', 'Translatable#Postal Address',
                [
                    'organisation-edit-form-field-street',
                    'organisation-edit-form-field-zip',
                    'organisation-edit-form-field-city',
                    'organisation-edit-form-field-country'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-comment',
                'Translatable#Comment', OrganisationProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_OrganisationCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'organisation-edit-form-field-valid',
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
                'organisation-edit-form-group-other', 'Translatable#Other',
                [
                    'organisation-edit-form-field-comment',
                    'organisation-edit-form-field-valid'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'organisation-edit-form-page', 'Translatable#Edit Organisation',
                [
                    'organisation-edit-form-group-information',
                    'organisation-edit-form-group-address',
                    'organisation-edit-form-group-other'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Organisation',
                ['organisation-edit-form-page'],
                KIXObjectType.ORGANISATION, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.ORGANISATION, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
