/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { ContactProperty } from './model/ContactProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormValidationService } from '../../modules/base-components/webapp/core/FormValidationService';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { EditContactDialogContext } from './webapp/core/context/EditContactDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'contact-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Contact', [], null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-edit-dialog-widget', 'contact-edit-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.EDIT
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'contact-edit-form';
        const configurations = [];

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-title',
                'Translatable#Title', ContactProperty.TITLE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-firstname',
                'Translatable#First Name', ContactProperty.FIRSTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Firstname'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-lastname',
                'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Lastname'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-organisation',
                'Translatable#Organisations', ContactProperty.ORGANISATION_IDS, 'object-reference-input',
                false, 'Translatable#Helptext_Customers_ContactCreate_Organisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true)
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-primary-organisation',
                'Translatable#Primary Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'object-reference-input',
                false, 'Translatable#Helptext_Customers_ContactCreate_PrimaryOrganisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, [])
                ]
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-phone',
                'Translatable#Phone', ContactProperty.PHONE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Phone'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-mobile',
                'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Mobile'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-fax',
                'Translatable#Fax', ContactProperty.FAX, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Fax'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-email',
                'Translatable#Email', ContactProperty.EMAIL, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,

                [
                    new FormFieldConfiguration(
                        'contact-edit-form-field-email1',
                        'Translatable#Email1', ContactProperty.EMAIL1, null, false,
                        'Translatable#Helptext_Customers_ContactCreate_Email',
                        null, null, null,
                        null, null, null, null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    ),
                    new FormFieldConfiguration(
                        'contact-edit-form-field-email2',
                        'Translatable#Email2', ContactProperty.EMAIL2, null, false,
                        'Translatable#Helptext_Customers_ContactCreate_Email',
                        null, null, null,
                        null, null, null, null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    ),
                    new FormFieldConfiguration(
                        'contact-edit-form-field-email3',
                        'Translatable#Email3', ContactProperty.EMAIL3, null, false,
                        'Translatable#Helptext_Customers_ContactCreate_Email',
                        null, null, null,
                        null, null, null, null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    ),
                    new FormFieldConfiguration(
                        'contact-edit-form-field-email4',
                        'Translatable#Email4', ContactProperty.EMAIL4, null, false,
                        'Translatable#Helptext_Customers_ContactCreate_Email',
                        null, null, null,
                        null, null, null, null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    ),
                    new FormFieldConfiguration(
                        'contact-edit-form-field-email5',
                        'Translatable#Email5', ContactProperty.EMAIL5, null, false,
                        'Translatable#Helptext_Customers_ContactCreate_Email',
                        null, null, null,
                        null, null, null, null, null, null,
                        FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    )
                ],
                null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-communication-container', 'Translatable#Communication',
                'COMMUNICATION_CONTAINER', null, false, null, null, null,
                [
                    'contact-edit-form-field-phone',
                    'contact-edit-form-field-mobile',
                    'contact-edit-form-field-fax',
                    'contact-edit-form-field-email'
                ], null, null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-street',
                'Translatable#Street', ContactProperty.STREET, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Street'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-zip',
                'Translatable#Zip', ContactProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Zip'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-city',
                'Translatable#City', ContactProperty.CITY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_City'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-country',
                'Translatable#Country', ContactProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Country'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-address-container', 'Translatable#Postal Address',
                'ADDRESS_CONTAINER', null, false, null, null, null,
                [
                    'contact-edit-form-field-street',
                    'contact-edit-form-field-zip',
                    'contact-edit-form-field-city',
                    'contact-edit-form-field-country'
                ], null, null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-icon',
                'Translatable#Avatar', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Avatar.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-comment',
                'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Customers_ContactCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-edit-form-field-other-container', 'Translatable#Other',
                'OTHER_CONTAINER', null, false, null, null, null,
                [
                    'contact-edit-form-field-icon',
                    'contact-edit-form-field-comment',
                    'contact-edit-form-field-valid'
                ], null, null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-edit-form-group-information', 'Translatable#Contact Information',
                [
                    'contact-edit-form-field-title',
                    'contact-edit-form-field-firstname',
                    'contact-edit-form-field-lastname',
                    'contact-edit-form-field-organisation',
                    'contact-edit-form-field-primary-organisation',
                    'contact-edit-form-field-communication-container',
                    'contact-edit-form-field-address-container',
                    'contact-edit-form-field-other-container'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'contact-edit-form-page', 'Translatable#New Contact',
                [
                    'contact-edit-form-group-information'
                ]
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Edit Contact',
                ['contact-edit-form-page'],
                KIXObjectType.CONTACT, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.CONTACT, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
