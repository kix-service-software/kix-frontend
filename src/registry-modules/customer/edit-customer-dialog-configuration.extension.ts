import {
    ContextConfiguration, FormField, CustomerSourceAttributeMapping, Form, FormContext, KIXObjectType, CustomerProperty
} from "../../core/model";
import { IConfigurationExtension } from "../../core/extensions";
import {
    CustomerLabelProvider, EditCustomerDialogContext, EditCustomerDialogContextConfiguration
} from "../../core/browser/customer";
import { CustomerService, ConfigurationService } from "../../core/services";
import { FormGroup } from "../../core/model/components/form/FormGroup";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditCustomerDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new EditCustomerDialogContextConfiguration();
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-customer-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm || overwrite) {
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

            const form = new Form(formId, 'Edit Customer', groups, KIXObjectType.CUSTOMER, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.CUSTOMER, formId);
    }

    private getHint(label: string, attribute: string): string {
        // tslint:disable:max-line-length
        let hint = label;
        switch (attribute) {
            case CustomerProperty.CUSTOMER_ID:
                hint = 'Insert a unique identifier (e.g. a customer number) for the customer.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_NAME:
                hint = 'Insert a name for the customer.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_STREET:
                hint = 'Insert the street for the customer address.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_ZIP:
                hint = 'Insert the postcode for the customer address.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_CITY:
                hint = 'Insert a city for the customer address.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_URL:
                hint = 'Insert the URL of the customer.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COUNTRY:
                hint = 'Insert a country for the customer address.';
                break;
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                hint = 'Insert additional information about the customer.';
                break;
            case CustomerProperty.VALID_ID:
                hint = 'Set the customer as „valid“, „invalid (temporarily)“, or „invalid“.';
                break;
            default:
        }
        return hint;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
