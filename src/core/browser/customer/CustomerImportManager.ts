import { KIXObjectType, InputFieldTypes, TreeNode, SortUtil, CustomerProperty, Customer } from "../../model";
import { LabelService } from "../LabelService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportManager, ImportPropertyOperator } from "../import";
import { CustomerService } from "./CustomerService";

export class CustomerImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            CustomerProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, 1)
        );
    }

    protected getSpecificObject(object: {}): Customer {
        return new Customer(object as Customer);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        // TODO: CustomerDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const customerDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        switch (property) {
            case CustomerProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                return InputFieldTypes.TEXT_AREA;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: CustomerProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        // TODO: CustomerDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const customerDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        switch (property) {
            case CustomerProperty.CUSTOMER_COMPANY_COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        // TODO: CustomerDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const customerDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        const attributes = [
            CustomerProperty.CUSTOMER_COMPANY_NAME,
            CustomerProperty.CUSTOMER_COMPANY_URL,
            CustomerProperty.CUSTOMER_COMPANY_STREET,
            CustomerProperty.CUSTOMER_COMPANY_CITY,
            CustomerProperty.CUSTOMER_COMPANY_ZIP,
            CustomerProperty.CUSTOMER_COMPANY_COUNTRY,
            CustomerProperty.CUSTOMER_COMPANY_COMMENT,
            CustomerProperty.VALID_ID
        ];
        for (const attribute of attributes) {
            const label = await labelProvider.getPropertyText(attribute);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [CustomerProperty.CUSTOMER_ID];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await CustomerService.getInstance().getTreeNodes(property);
    }
}
