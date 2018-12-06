import {
    ContextConfiguration, FormField, CustomerSourceAttributeMapping, Form, FormContext, KIXObjectType, CustomerProperty
} from "@kix/core/dist/model";
import { IConfigurationExtension } from "@kix/core/dist/extensions";
import {
    CustomerLabelProvider, EditCustomerDialogContext, EditCustomerDialogContextConfiguration
} from "@kix/core/dist/browser/customer";
import { CustomerService, ConfigurationService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditCustomerDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new EditCustomerDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-customer-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const customerService = CustomerService.getInstance();

            const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;
            const mapping: CustomerSourceAttributeMapping[] = await customerService.getAttributeMapping(token);
            let groups: FormGroup[] = [];
            const lastGroup = new FormGroup("Default", []);

            const labelProvider = new CustomerLabelProvider();

            for (const attribute of mapping) {

                if (attribute.Attribute === CustomerProperty.CUSTOMER_ID) {
                    continue;
                }

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

                if (attribute.Attribute === CustomerProperty.VALID_ID) {
                    formField.inputComponent = 'valid-input';
                }
                if (attribute.Attribute === CustomerProperty.CUSTOMER_COMPANY_COMMENT) {
                    formField.inputComponent = 'text-area-input';
                    formField.maxLength = 250;
                }

                group.formFields.push(formField);
            }

            groups = [...groups, lastGroup].filter((g) => g.formFields.length);

            const form = new Form(formId, 'Kunde Bearbeiten', groups, KIXObjectType.CUSTOMER, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.CUSTOMER, formId);
    }

    private getHint(label: string, attribute: string): string {
        // tslint:disable:max-line-length
        let hint = label;
        switch (attribute) {
            case CustomerProperty.CUSTOMER_ID:
                hint = 'Geben Sie einen eindeutigen Identifier (z.B. eine Kundennummer) für den Kunden ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_NAME:
                hint = 'Geben Sie eine Bezeichnung für den Kunden ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_STREET:
                hint = 'Geben Sie die Straße der Kundenadresse ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_ZIP:
                hint = 'Geben Sie die Postleitzahl (PLZ) der Kundenadresse ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_City:
                hint = 'Geben Sie den Ort für die Kundenadresse ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_URL:
                hint = 'Geben Sie die URL der Website des Kunden ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COUNTRY:
                hint = 'Geben Sie das Land für die Kundenadresse ein.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                hint = 'Hinterlegen Sie hier zusätzliche Informationen zum Kunden.';
                break;
            case CustomerProperty.VALID_ID:
                hint = 'Legen Sie fest, ob der Kundeneintrag „gültig“, „temporär ungültig“ oder „ungültig“ ist.';
                break;
            default:
        }
        return hint;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
