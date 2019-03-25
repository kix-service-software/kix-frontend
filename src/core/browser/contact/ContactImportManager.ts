import {
    KIXObjectType, InputFieldTypes, TreeNode, SortUtil, ContactProperty,
    Contact, KIXObjectLoadingOptions, Customer, ObjectIcon
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportManager, ImportPropertyOperator } from "../import";
import { ContactService } from "./ContactService";
import { KIXObjectService } from "../kix";

export class ContactImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public reset(): void {
        super.reset();
        this.importValues.push(new ObjectPropertyValue(
            ContactProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, 1)
        );
    }

    protected getSpecificObject(object: {}): Contact {
        object[ContactProperty.ContactID] = object[ContactProperty.USER_LOGIN];
        return new Contact(object as Contact);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        // TODO: ContactDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const contactDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        switch (property) {
            case ContactProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case ContactProperty.USER_COMMENT:
                return InputFieldTypes.TEXT_AREA;
            case ContactProperty.USER_CUSTOMER_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: ContactProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        // TODO: ContactDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const contactDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        switch (property) {
            case ContactProperty.USER_COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        // TODO: ContactDefinition verwenden
        // const objectData = ContextService.getInstance().getObjectData();
        // const contactDefinition = objectData.objectDefinitions.find((od) => od.Object === this.objectType);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        const attributes = [
            ContactProperty.USER_PASSWORD,
            ContactProperty.USER_CUSTOMER_ID,
            // ContactProperty.USER_CUSTOMER_IDS, // TODO später
            ContactProperty.USER_FIRST_NAME,
            ContactProperty.USER_LAST_NAME,
            ContactProperty.USER_TITLE,
            // TODO: email syntax prüfen (oder nur backend)? --> wenn auch frontend: siehe "input type=email"
            ContactProperty.USER_EMAIL,
            ContactProperty.USER_PHONE,
            ContactProperty.USER_MOBILE,
            ContactProperty.USER_FAX,
            ContactProperty.USER_STREET,
            ContactProperty.USER_CITY,
            ContactProperty.USER_ZIP,
            ContactProperty.USER_COUNTRY,
            ContactProperty.VALID_ID
        ];
        for (const attribute of attributes) {
            const label = await labelProvider.getPropertyText(attribute);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [ContactProperty.USER_LOGIN, ContactProperty.USER_CUSTOMER_ID];
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        switch (property) {
            case ContactProperty.USER_CUSTOMER_ID:
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
                const contacts = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, null, loadingOptions, null, false
                );
                return contacts.map(
                    (c) => new TreeNode(c.CustomerID, c.DisplayValue, new ObjectIcon(c.KIXObjectType, c.CustomerID))
                );
            default:
        }

        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await ContactService.getInstance().getTreeNodes(property);
    }
}
