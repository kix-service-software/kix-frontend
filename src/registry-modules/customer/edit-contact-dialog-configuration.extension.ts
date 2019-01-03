import {
    ContextConfiguration, FormField, ContactSourceAttributeMapping,
    Form, FormContext, KIXObjectType, ContactProperty
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    EditContactDialogContextConfiguration, EditContactDialogContext, ContactLabelProvider
} from "../../core/browser/contact";
import { FormGroup } from "../../core/model/components/form/FormGroup";
import { ConfigurationService, ContactService } from "../../core/services";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditContactDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new EditContactDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-contact-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const contactService = ContactService.getInstance();

            const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;
            const mapping: ContactSourceAttributeMapping[] = await contactService.getAttributeMapping(token);
            let groups: FormGroup[] = [];
            const lastGroup = new FormGroup("Default", []);

            const labelProvider = new ContactLabelProvider();

            for (const attribute of mapping) {
                // TODO: USER_CUSTOMER_IDS Behandlung - neuer Feldtyp (Multiselect)?
                if (attribute.Attribute !== ContactProperty.USER_CUSTOMER_IDS
                    && attribute.Attribute !== ContactProperty.USER_LOGIN) {

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
                }
            }

            groups = [...groups, lastGroup].filter((g) => g.formFields.length);
            const form = new Form(
                formId, 'Ansprechpartner Bearbeiten', groups, KIXObjectType.CONTACT, true, FormContext.EDIT
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.CONTACT, formId);
    }

    private getHint(label: string, attribute: string): string {
        // tslint:disable:max-line-length
        let hint = label;
        switch (attribute) {
            case ContactProperty.USER_FIRST_NAME:
                hint = 'Geben Sie den Vornamen des Ansprechpartners ein.';
                break;
            case ContactProperty.USER_LAST_NAME:
                hint = 'Geben Sie den Nachname des Ansprechpartners ein.';
                break;
            case ContactProperty.USER_LOGIN:
                hint = 'Geben Sie den Login (Nutzername) des Ansprechpartners ein.';
                break;
            case ContactProperty.USER_PHONE:
                hint = 'Geben Sie eine Telefonnummer für den Ansprechpartner ein.';
                break;
            case ContactProperty.USER_FAX:
                hint = 'Geben Sie eine Faxnummer für den Ansprechpartner ein.';
                break;
            case ContactProperty.USER_EMAIL:
                hint = 'Geben Sie eine gültige E-Mail-Adresse für den Ansprechpartner ein.';
                break;
            case ContactProperty.USER_STREET:
                hint = 'Geben Sie die Straße der  Ansprechpartner-Adresse ein.';
                break;
            case ContactProperty.USER_ZIP:
                hint = 'Geben Sie die Postleitzahl (PLZ) der  Ansprechpartner-Adresse ein.';
                break;
            case ContactProperty.USER_CITY:
                hint = 'Geben Sie den Ort der  Ansprechpartner-Adresse ein.';
                break;
            case ContactProperty.USER_TITLE:
                hint = 'Geben Sie einen Titel für den Ansprechpartner ein.';
                break;
            case ContactProperty.USER_CUSTOMER_ID:
                hint = 'Wählen Sie den Kunden, für welchen der Ansprechpartner zugeordnet sein soll. Bei der Eingabe von mindestens 3 Zeichen wird Ihnen eine Vorschlagsliste mit bereits im System angelegten Kunden angezeigt.  „***“ zeigt alle Einträge an. (Suchfelder: „Kunden ID“ und „Kundenname“)';
                break;
            case ContactProperty.USER_MOBILE:
                hint = 'Geben Sie  eine Mobilfunknummer für den Ansprechpartner ein.';
                break;
            case ContactProperty.USER_COUNTRY:
                hint = 'Geben Sie  ein Land für die Ansprechpartner-Adresse ein.';
                break;
            case ContactProperty.USER_COMMENT:
                hint = 'Geben Sie zusätzliche Informationen zum Kunden an.';
                break;
            case ContactProperty.VALID_ID:
                hint = 'Legen Sie fest, ob der Ansprechpartner-Eintrag „gültig“, „temporär ungültig“ oder „ungültig“ ist.';
                break;
            default:
        }
        return hint;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
