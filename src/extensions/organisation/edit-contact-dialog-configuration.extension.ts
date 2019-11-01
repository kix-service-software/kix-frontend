/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, FormContext, KIXObjectType,
    ContactProperty, KIXObjectProperty, ObjectReferenceOptions, FormFieldValue,
    FormFieldOption, ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { EditContactDialogContext } from "../../core/browser/contact";
import { ConfigurationType } from "../../core/model/configuration";
import { ModuleConfigurationService } from "../../services";
import {
    FormFieldConfiguration, FormConfiguration, FormGroupConfiguration
} from "../../core/model/components/form/configuration";
import { ConfigurationService } from "../../core/services";
import { FormValidationService } from "../../core/browser/form/validation";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditContactDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'contact-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-contact-dialog', 'Translatable#Edit Contact', [], null, null, false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'contact-edit-dialog-widget', 'contact-edit-dialog-widget',
                    KIXObjectType.CONTACT, ContextMode.EDIT
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'contact-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-title',
                'Translatable#Title', ContactProperty.TITLE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Title'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-firstname',
                'Translatable#First Name', ContactProperty.FIRSTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Firstname'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-lastname',
                'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Lastname'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-organisation',
                'Translatable#Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'contact-input-organisation',
                true, 'Translatable#Helptext_Customers_ContactCreate_Organisation'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'contact-edit-form-group-information', 'Translatable#Contact Information',
                [
                    'contact-edit-form-field-title',
                    'contact-edit-form-field-firstname',
                    'contact-edit-form-field-lastname',
                    'contact-edit-form-field-organisation'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-phone',
                'Translatable#Phone', ContactProperty.PHONE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Phone'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-mobile',
                'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Mobile'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-fax',
                'Translatable#Fax', ContactProperty.FAX, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Fax'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-email',
                'Translatable#Email', ContactProperty.EMAIL, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null, null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'contact-edit-form-group-communication', 'Translatable#Communication',
                [
                    'contact-edit-form-field-phone',
                    'contact-edit-form-field-mobile',
                    'contact-edit-form-field-fax',
                    'contact-edit-form-field-email'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-street',
                'Translatable#Street', ContactProperty.STREET, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Street'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-zip',
                'Translatable#Zip', ContactProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Zip'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-city',
                'Translatable#City', ContactProperty.CITY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_City'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-country',
                'Translatable#Country', ContactProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Country'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'contact-edit-form-group-address', 'Translatable#Postal Address',
                [
                    'contact-edit-form-field-street',
                    'contact-edit-form-field-zip',
                    'contact-edit-form-field-city',
                    'contact-edit-form-field-country'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-comment',
                'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Comment', null, null, null, null,
                null, null, null, 250
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'contact-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Customers_ContactCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'contact-edit-form-group-other', 'Translatable#Other',
                [
                    'contact-edit-form-field-comment',
                    'contact-edit-form-field-valid'
                ]
            )
        );


        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'New Contact',
                [
                    'contact-edit-form-group-information',
                    'contact-edit-form-group-communication',
                    'contact-edit-form-group-address',
                    'contact-edit-form-group-other'
                ],
                KIXObjectType.CONTACT, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.CONTACT, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
