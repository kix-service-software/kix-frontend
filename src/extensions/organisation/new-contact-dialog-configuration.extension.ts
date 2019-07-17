import {
    ContextConfiguration, FormField, Form, FormContext, KIXObjectType,
    ContactProperty, FormFieldOption, FormFieldOptions, InputFieldTypes, KIXObjectProperty, FormFieldValue
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { NewContactDialogContext } from '../../core/browser/contact';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { FormValidationService } from '../../core/browser/form/validation';

export class NewContactDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-contact-form';
        const existingForm = configurationService.getConfiguration(formId);
        if (!existingForm || overwrite) {
            const groups: FormGroup[] = [];

            groups.push(new FormGroup('Translatable#Contact Information', [
                new FormField(
                    'Translatable#Title', ContactProperty.TITLE, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Title'
                ),
                new FormField(
                    'Translatable#Lastname', ContactProperty.LASTNAME, null, true,
                    'Translatable#Helptext_Organisations_ContactCreate_Lastname'
                ),
                new FormField(
                    'Translatable#Firstname', ContactProperty.FIRSTNAME, null, true,
                    'Translatable#Helptext_Organisations_ContactCreate_Firstname'
                ),
                new FormField(
                    'Translatable#Login Name', ContactProperty.LOGIN, null, true,
                    'Translatable#Helptext_Organisations_ContactCreate_Login'
                ),
                new FormField('Translatable#Password', ContactProperty.PASSWORD, null, true,
                    'Translatable#Helptext_Organisations_ContactCreate_Password',
                    [new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)]),
                new FormField(
                    'Translatable#Organisation', ContactProperty.PRIMARY_ORGANISATION_ID, 'contact-input-organisation',
                    true, 'Translatable#Helptext_Organisations_ContactCreate_Organisation'
                ),
            ]));

            groups.push(new FormGroup('Translatable#Communication', [
                new FormField(
                    'Translatable#Phone', ContactProperty.PHONE, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Phone'
                ),
                new FormField(
                    'Translatable#Mobile', ContactProperty.MOBILE, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Mobile'
                ),
                new FormField(
                    'Translatable#Fax', ContactProperty.FAX, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Fax'
                ),
                new FormField(
                    'Translatable#Email', ContactProperty.EMAIL, null, true,
                    'Translatable#Helptext_Organisations_ContactCreate_Email',
                    null, null, null, null, null, null, null, null,
                    FormValidationService.EMAIL_REGEX, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                ),
            ]));

            groups.push(new FormGroup('Translatable#Postal Address', [
                new FormField(
                    'Translatable#Street', ContactProperty.STREET, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Street'
                ),
                new FormField(
                    'Translatable#Zip', ContactProperty.ZIP, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Zip'
                ),
                new FormField(
                    'Translatable#City', ContactProperty.CITY, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_City'
                ),
                new FormField(
                    'Translatable#Country', ContactProperty.COUNTRY, null, false,
                    'Translatable#Helptext_Organisations_ContactCreate_Country'
                )
            ]));

            groups.push(new FormGroup('Translatable#Other', [
                new FormField(
                    'Translatable#Comment', ContactProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Organisations_ContactCreate_Comment', null, null, null, null,
                    null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Organisations_ContactCreate_Validity', undefined, new FormFieldValue(1)
                )
            ]));


            const form = new Form(formId, 'New Contact', groups, KIXObjectType.CONTACT);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);
    }
}

module.exports = (data, host, options) => {
    return new NewContactDialogModuleExtension();
};
