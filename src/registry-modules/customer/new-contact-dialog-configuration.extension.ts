import {
    ContextConfiguration, FormField, ContactSourceAttributeMapping,
    Form, FormContext, KIXObjectType,
    ContactProperty, FormFieldOption, FormFieldOptions, InputFieldTypes
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import {
    NewContactDialogContextConfiguration, NewContactDialogContext, ContactLabelProvider
} from '../../core/browser/contact';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService, ContactService } from '../../core/services';

export class NewContactDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new NewContactDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-contact-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
            const contactService = ContactService.getInstance();

            const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;
            const mapping: ContactSourceAttributeMapping[] = await contactService.getAttributeMapping(token);
            let groups: FormGroup[] = [];
            const lastGroup = new FormGroup('Default', []);

            const labelProvider = new ContactLabelProvider();

            for (const attribute of mapping) {
                // TODO: USER_CUSTOMER_IDS Behandlung - neuer Feldtyp (Multiselect)?
                if (attribute.Attribute !== ContactProperty.USER_CUSTOMER_IDS) {

                    let group = groups.find((g) => g.name === attribute.DisplayGroup);
                    if (!group) {
                        if (attribute.DisplayGroup) {
                            group = new FormGroup(attribute.DisplayGroup, []);
                            groups.push(group);
                        } else {
                            group = lastGroup;
                        }
                    }

                    let label = await labelProvider.getPropertyText(attribute.Attribute);
                    if (label === attribute.Attribute) {
                        label = attribute.Label;
                    }

                    const hint = this.getHint(label, attribute.Attribute);
                    const formField = new FormField(label, attribute.Attribute, null, attribute.Required, hint);
                    if (attribute.Attribute === ContactProperty.USER_CUSTOMER_ID) {
                        formField.inputComponent = 'contact-input-customer';
                    } else if (attribute.Attribute === ContactProperty.VALID_ID) {
                        formField.inputComponent = 'valid-input';
                    } else if (attribute.Attribute === ContactProperty.USER_COMMENT) {
                        formField.inputComponent = 'text-area-input';
                        formField.maxLength = 250;
                    }

                    group.formFields.push(formField);

                    // TODO: eventuell wieder entfernen?
                    if (attribute.Attribute === ContactProperty.USER_LOGIN) {
                        group.formFields.push(
                            // tslint:disable-next-line:max-line-length
                            new FormField('Translatable#Password', ContactProperty.USER_PASSWORD, null, true, 'Translatable#Legen Sie ein Passwort für den Ansprechpartner fest.',
                                [
                                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                                ])
                        );
                    }
                }
            }

            groups = [...groups, lastGroup].filter((g) => g.formFields.length);
            const form = new Form(formId, 'New Contact', groups, KIXObjectType.CONTACT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);
    }

    private getHint(label: string, attribute: string): string {
        // tslint:disable:max-line-length
        let hint = label;
        switch (attribute) {
            case ContactProperty.USER_FIRST_NAME:
                hint = 'Insert the contact‘s first name.';
                break;
            case ContactProperty.USER_LAST_NAME:
                hint = 'Insert the contact‘s last name.';
                break;
            case ContactProperty.USER_LOGIN:
                hint = 'Insert the contact login (username).';
                break;
            case ContactProperty.USER_PHONE:
                hint = 'Insert the phone number for the contact.';
                break;
            case ContactProperty.USER_FAX:
                hint = 'Insert the fax number for the contact.';
                break;
            case ContactProperty.USER_EMAIL:
                hint = 'Insert the e-mail address for the contact.';
                break;
            case ContactProperty.USER_STREET:
                hint = 'Insert the street for the contact address.';
                break;
            case ContactProperty.USER_ZIP:
                hint = 'Insert the postcode for the cotact address.';
                break;
            case ContactProperty.USER_CITY:
                hint = 'Insert a city for the contact address.';
                break;
            case ContactProperty.USER_TITLE:
                hint = 'Insert a title for the contact.';
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                hint = 'Select a customer to which this contact is assigned to. Enter at least 3 characters in order to get a suggestion list of available customers (searchin cusgtomer id and customer names). You may use „*“ as wildcard.';
                break;
            case ContactProperty.USER_MOBILE:
                hint = 'Insert the mobile phone number for the contact.';
                break;
            case ContactProperty.USER_COUNTRY:
                hint = 'Insert the country for the customer address.';
                break;
            case ContactProperty.USER_COMMENT:
                hint = 'Insert additional information for this contact.';
                break;
            case ContactProperty.VALID_ID:
                hint = 'Set the contact as „valid“, „invalid (temporarily)“, or „invalid“.';
                break;
            default:
        }
        return hint;
    }

}

module.exports = (data, host, options) => {
    return new NewContactDialogModuleExtension();
};
