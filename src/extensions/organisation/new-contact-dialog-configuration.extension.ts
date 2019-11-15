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
    ContactProperty, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty, FormFieldValue, ObjectReferenceOptions, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { NewContactDialogContext } from '../../core/browser/contact';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { FormValidationService } from '../../core/browser/form/validation';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class NewContactDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'contact-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-contact-dialog', 'Translatable#New Contact',
            [], null, null, false, false, 'kix-icon-man-bubble-new'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-new-dialog-widget', 'contact-new-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.CREATE
                    )
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'contact-new-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-title',
                'Translatable#Title', ContactProperty.TITLE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-firstname',
                'Translatable#First Name', ContactProperty.FIRSTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Firstname'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-lastname',
                'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Lastname'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-login',
                'Translatable#Login Name', ContactProperty.LOGIN, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Login'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-password',
                'Translatable#Password', ContactProperty.PASSWORD, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-organisation',
                'Translatable#Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'contact-input-organisation',
                true, 'Translatable#Helptext_Customers_ContactCreate_Organisation'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-new-form-group-information', 'Translatable#Contact Information',
                [
                    'contact-new-form-field-title',
                    'contact-new-form-field-firstname',
                    'contact-new-form-field-lastname',
                    'contact-new-form-field-login',
                    'contact-new-form-field-password',
                    'contact-new-form-field-organisation'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-phone',
                'Translatable#Phone', ContactProperty.PHONE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Phone'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-mobile',
                'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Mobile'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-fax',
                'Translatable#Fax', ContactProperty.FAX, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Fax'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-email',
                'Translatable#Email', ContactProperty.EMAIL, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null, null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-new-form-group-communication', 'Translatable#Communication',
                [
                    'contact-new-form-field-phone',
                    'contact-new-form-field-mobile',
                    'contact-new-form-field-fax',
                    'contact-new-form-field-email'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-street',
                'Translatable#Street', ContactProperty.STREET, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Street'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-zip',
                'Translatable#Zip', ContactProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Zip'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-city',
                'Translatable#City', ContactProperty.CITY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_City'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-country',
                'Translatable#Country', ContactProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Country'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-new-form-group-address', 'Translatable#Postal Address',
                [
                    'contact-new-form-field-street',
                    'contact-new-form-field-zip',
                    'contact-new-form-field-city',
                    'contact-new-form-field-country'
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-comment',
                'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Customers_ContactCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-new-form-group-other', 'Translatable#Other',
                [
                    'contact-new-form-field-comment',
                    'contact-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'contact-new-form-page', 'Translatable#New Contact',
                [
                    'contact-new-form-group-information',
                    'contact-new-form-group-communication',
                    'contact-new-form-group-address',
                    'contact-new-form-group-other'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Contact',
                ['contact-new-form-page'],
                KIXObjectType.CONTACT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new NewContactDialogModuleExtension();
};
