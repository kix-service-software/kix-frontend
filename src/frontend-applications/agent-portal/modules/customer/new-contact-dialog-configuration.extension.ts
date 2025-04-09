/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-lines-per-function */

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
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';
import { FormLayout } from '../object-forms/model/layout/FormLayout';
import { RowLayout } from '../object-forms/model/layout/RowLayout';
import { RowColumnLayout } from '../object-forms/model/layout/RowColumnLayout';

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

        const formConfiguration = new FormConfiguration(
            formId, 'New Contact', [], KIXObjectType.CONTACT, true, FormContext.NEW
        );

        const contactPageConfiguration = new FormPageConfiguration(
            'contact-new-form-page', 'Translatable#Contact Information',
        );
        formConfiguration.pages.push(contactPageConfiguration);

        const infoGroup = new FormGroupConfiguration(
            'contact-new-form-group-information', 'Translatable#Contact Information'
        );
        contactPageConfiguration.groups.push(infoGroup);
        infoGroup.formFields.push(
            new FormFieldConfiguration(
                'contact-new-form-field-title',
                'Translatable#Title', ContactProperty.TITLE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Title'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-firstname',
                'Translatable#First Name', ContactProperty.FIRSTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Firstname'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-lastname',
                'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Lastname'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-organisation',
                'Translatable#Organisations', ContactProperty.ORGANISATION_IDS, 'object-reference-input',
                false, 'Translatable#Helptext_Customers_ContactCreate_Organisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                    new FormFieldOption(FormFieldOptions.SHOW_INVALID, false)
                ]
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-primary-organisation',
                'Translatable#Primary Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'object-reference-input',
                false, 'Translatable#Helptext_Customers_ContactCreate_PrimaryOrganisation',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ORGANISATION),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.OBJECT_IDS, []),
                    new FormFieldOption(ObjectReferenceOptions.KEEP_SELECTION, true),
                ]
            )
        );

        const emailGroup = new FormGroupConfiguration(
            'contact-new-form-group-email', 'Translatable#Email'
        );
        contactPageConfiguration.groups.push(emailGroup);
        emailGroup.formFields.push(
            new FormFieldConfiguration(
                'contact-new-form-field-email',
                'Translatable#Email', ContactProperty.EMAIL, null, true,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null, [], null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-email1',
                'Translatable#Email1', ContactProperty.EMAIL1, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,
                null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-email2',
                'Translatable#Email2', ContactProperty.EMAIL2, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,
                null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-email3',
                'Translatable#Email3', ContactProperty.EMAIL3, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,
                null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-email4',
                'Translatable#Email4', ContactProperty.EMAIL4, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,
                null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-email5',
                'Translatable#Email5', ContactProperty.EMAIL5, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Email',
                null, null, null,
                null, null, null, null, null, null,
                FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
            )
        );

        const communicationGroup = new FormGroupConfiguration(
            'contact-new-form-field-communication-container', 'Translatable#Communication'
        );
        contactPageConfiguration.groups.push(communicationGroup);
        communicationGroup.formFields.push(
            new FormFieldConfiguration(
                'contact-new-form-field-phone',
                'Translatable#Phone', ContactProperty.PHONE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Phone'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-mobile',
                'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Mobile'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-fax',
                'Translatable#Fax', ContactProperty.FAX, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Fax'
            )
        );

        const addressGroup = new FormGroupConfiguration(
            'contact-new-form-field-address-container', 'Translatable#Postal Address'
        );
        contactPageConfiguration.groups.push(addressGroup);
        addressGroup.formFields.push(
            new FormFieldConfiguration(
                'contact-new-form-field-street',
                'Translatable#Street', ContactProperty.STREET, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Street'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-zip',
                'Translatable#Zip', ContactProperty.ZIP, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Zip'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-city',
                'Translatable#City', ContactProperty.CITY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_City'
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-country',
                'Translatable#Country', ContactProperty.COUNTRY, null, false,
                'Translatable#Helptext_Customers_ContactCreate_Country'
            )
        );

        const otherGroup = new FormGroupConfiguration(
            'contact-new-form-group-other', 'Translatable#Other',
        );
        contactPageConfiguration.groups.push(otherGroup);
        otherGroup.formFields.push(
            new FormFieldConfiguration(
                'contact-new-form-field-icon',
                'Translatable#Avatar', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Avatar.',
                [
                    new FormFieldOption('ICON_LIBRARY', false)
                ]
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-comment',
                'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Customers_ContactCreate_Comment', null, null, null, null,
                null, null, null, null, 250
            ),
            new FormFieldConfiguration(
                'contact-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Customers_ContactCreate_Validity', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
            )
        );

        const formLayout = formConfiguration.formLayout = new FormLayout();
        const rowLayout = new RowLayout(contactPageConfiguration.id);
        formLayout.rowLayout.push(rowLayout);

        rowLayout.rows.push(
            [
                new RowColumnLayout([infoGroup.id], 12, 6, 4),
                new RowColumnLayout([emailGroup.id], 12, 6, 4),
                new RowColumnLayout([otherGroup.id], 12, 6, 4)
            ],
            [
                new RowColumnLayout([addressGroup.id], 12, 6, 6),
                new RowColumnLayout([communicationGroup.id], 12, 6, 6)
            ]
        );

        ModuleConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);

        return [formConfiguration];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
