import {
    ContextConfiguration, FormField, CustomerSourceAttributeMapping, Form, FormContext, KIXObjectType, CustomerProperty
} from "@kix/core/dist/model";
import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    NewCustomerDialogContextConfiguration, NewCustomerDialogContext, CustomerLabelProvider
} from "@kix/core/dist/browser/customer";
import { ServiceContainer } from "@kix/core/dist/common";
import { IConfigurationService, ICustomerService } from "@kix/core/dist/services";
import { FormGroup } from "@kix/core/dist/model/components/form/FormGroup";

export class NewCustomerDialogModuleExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return NewCustomerDialogContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        return new NewCustomerDialogContextConfiguration();
    }

    public async createFormDefinitions(): Promise<void> {
        const configurationService =
            ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

        const formId = 'new-customer-form';
        const existingForm = configurationService.getModuleConfiguration(formId, null);
        if (!existingForm) {
            const customerService =
                ServiceContainer.getInstance().getClass<ICustomerService>("ICustomerService");

            const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;
            const mapping: CustomerSourceAttributeMapping[] = await customerService.getAttributeMapping(token);
            let groups: FormGroup[] = [];
            const lastGroup = new FormGroup("Default", []);

            const labelProvider = new CustomerLabelProvider();

            for (const attribute of mapping) {
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

                let componentId = null;
                if (attribute.Attribute === CustomerProperty.VALID_ID) {
                    componentId = 'valid-input';
                }
                if (attribute.Attribute === CustomerProperty.CUSTOMER_COMPANY_COMMENT) {
                    componentId = 'text-area-input';
                }

                const hint = this.getHint(label, attribute.Attribute);
                const formField = new FormField(label, attribute.Attribute, componentId, attribute.Required, hint);
                group.formFields.push(formField);
            }

            groups = [...groups, lastGroup].filter((g) => g.formFields.length);

            const form = new Form(formId, 'Neuer Kunde', groups, KIXObjectType.CUSTOMER);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.CUSTOMER, formId);
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
    return new NewCustomerDialogModuleExtension();
};
