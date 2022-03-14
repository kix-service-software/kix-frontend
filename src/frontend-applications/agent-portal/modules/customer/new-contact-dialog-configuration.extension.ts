/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ModuleConfigurationService } from '../../server/services/configuration';
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
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormValidationService } from '../../modules/base-components/webapp/core/FormValidationService';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { NewContactDialogContext } from './webapp/core/context/NewContactDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'contact-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Contact',
            [], null, null, false, false, 'kix-icon-man-bubble-new'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'contact-new-dialog-widget', 'contact-new-dialog-widget',
                        KIXObjectType.CONTACT, ContextMode.CREATE
                    )
                ], [], [], [], []
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
                'contact-new-form-field-lastname',
                'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Lastname'
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
                'contact-new-form-field-organisation',
                'Translatable#Organisations', ContactProperty.ORGANISATION_IDS, 'object-reference-input',
                true, 'Translatable#Helptext_Customers_ContactCreate_Organisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true)
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-primary-organisation',
                'Translatable#Primary Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'object-reference-input',
                true, 'Translatable#Helptext_Customers_ContactCreate_PrimaryOrganisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false)
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
            new FormFieldConfiguration(
                'contact-new-form-field-communication-container', 'Translatable#Communication',
                'COMMUNICATION_CONTAINER', null, false, null, null, null,
                [
                    'contact-new-form-field-phone',
                    'contact-new-form-field-mobile',
                    'contact-new-form-field-fax',
                    'contact-new-form-field-email'
                ], null, null, null, null, null, null, null, null, true, true
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
            new FormFieldConfiguration(
                'contact-new-form-field-address-container', 'Translatable#Postal Address',
                'ADDRESS_CONTAINER', null, false, null, null, null,
                [
                    'contact-new-form-field-street',
                    'contact-new-form-field-zip',
                    'contact-new-form-field-city',
                    'contact-new-form-field-country'
                ], null, null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'contact-new-form-field-icon',
                'Translatable#Avatar', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Avatar.'
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
            new FormFieldConfiguration(
                'contact-new-form-field-other-container', 'Translatable#Other',
                'OTHER_CONTAINER', null, false, null, null, null,
                [
                    'contact-new-form-field-icon',
                    'contact-new-form-field-comment',
                    'contact-new-form-field-valid'
                ], null, null, null, null, null, null, null, null, true, true
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'contact-new-form-group-information', 'Translatable#Contact Information',
                [
                    'contact-new-form-field-title',
                    'contact-new-form-field-firstname',
                    'contact-new-form-field-lastname',
                    'contact-new-form-field-organisation',
                    'contact-new-form-field-primary-organisation',
                    'contact-new-form-field-communication-container',
                    'contact-new-form-field-address-container',
                    'contact-new-form-field-other-container'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'contact-new-form-page', 'Translatable#New Contact',
                [
                    'contact-new-form-group-information'
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
        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);

        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
