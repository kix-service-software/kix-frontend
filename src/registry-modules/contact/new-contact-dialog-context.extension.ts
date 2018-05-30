import {
    ContextConfiguration, FormField, ContactSourceAttributeMapping, Form, FormContext, KIXObjectType, ContactProperty
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    NewContactDialogContextConfiguration, NewContactDialogContext, ContactLabelProvider
} from "@kix/core/dist/browser/contact";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService, IContactService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";

export class NewContactDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewContactDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewContactDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'new-contact-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const contactService =
                ServiceContainer.getInstance().getClass<IContactService>("IContactService");

            const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;
            const mapping: ContactSourceAttributeMapping[] = await contactService.getAttributeMapping(token);
            const groups: FormGroup[] = [];
            const lastGroup = new FormGroup("Default", []);

            const labelProvider = new ContactLabelProvider();

            mapping.forEach((attribute) => {
                // TODO: USER_CUSTOMER_IDS Behandlung - neuer Feldtyp?
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

                    let label = labelProvider.getPropertyText(attribute.Attribute);
                    if (label === attribute.Attribute) {
                        label = attribute.Label;
                    }

                    group.formFields.push(
                        new FormField(label, attribute.Attribute, attribute.Required, label)
                    );
                }
            });

            const form = new Form(formId, 'Neuer Ansprechpartner', [...groups, lastGroup], KIXObjectType.CONTACT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CONTACT, formId);
    }

}

module.exports = (data, host, options) => {
    return new NewContactDialogModuleExtension();
};
