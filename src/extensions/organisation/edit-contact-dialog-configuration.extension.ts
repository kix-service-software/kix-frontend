/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextConfiguration, FormField, Form, FormContext, KIXObjectType,
    ContactProperty, KIXObjectProperty, ObjectReferenceOptions, FormFieldValue, FormFieldOption
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import { EditContactDialogContext } from "../../core/browser/contact";
import { FormGroup } from "../../core/model/components/form/FormGroup";
import { ConfigurationService } from "../../core/services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-contact-form';
        const existingForm = configurationService.getConfiguration(formId);
        if (!existingForm || overwrite) {
            const groups: FormGroup[] = [];

            groups.push(new FormGroup('Translatable#Contact Information', [
                new FormField(
                    'Translatable#Title', ContactProperty.TITLE, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Title'
                ),
                new FormField(
                    'Translatable#First Name', ContactProperty.FIRSTNAME, null, true,
                    'Translatable#Helptext_Customers_ContactEdit_Firstname'
                ),
                new FormField(
                    'Translatable#Last Name', ContactProperty.LASTNAME, null, true,
                    'Translatable#Helptext_Customers_ContactEdit_Lastname'
                ),
                new FormField(
                    'Translatable#Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'contact-input-organisation',
                    true, 'Translatable#Helptext_Customers_ContactEdit_Organisation'
                )
            ]));

            groups.push(new FormGroup('Translatable#Communication', [
                new FormField(
                    'Translatable#Phone', ContactProperty.PHONE, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Phone'
                ),
                new FormField(
                    'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Mobile'
                ),
                new FormField(
                    'Translatable#Fax', ContactProperty.FAX, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Fax'
                ),
                new FormField(
                    'Translatable#Email', ContactProperty.EMAIL, null, true,
                    'Translatable#Helptext_Customers_ContactEdit_Email'
                ),
            ]));

            groups.push(new FormGroup('Translatable#Postal Address', [
                new FormField(
                    'Translatable#Street', ContactProperty.STREET, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Street'
                ),
                new FormField(
                    'Translatable#Zip', ContactProperty.ZIP, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Zip'
                ),
                new FormField(
                    'Translatable#City', ContactProperty.CITY, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_City'
                ),
                new FormField(
                    'Translatable#Country', ContactProperty.COUNTRY, null, false,
                    'Translatable#Helptext_Customers_ContactEdit_Country'
                )
            ]));

            groups.push(new FormGroup('Translatable#Other', [
                new FormField(
                    'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Customers_ContactEdit_Comment', null, null, null, null,
                    null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_Customers_ContactEdit_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ], new FormFieldValue(1)
                )
            ]));


            const form = new Form(formId, 'Edit Contact', groups, KIXObjectType.CONTACT, undefined, FormContext.EDIT);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.CONTACT, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
