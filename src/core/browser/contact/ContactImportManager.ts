import {
    KIXObjectType, InputFieldTypes, TreeNode, SortUtil, ContactProperty,
    Contact, KIXObjectLoadingOptions, Organisation, ObjectIcon, KIXObjectProperty
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportManager, ImportPropertyOperator } from "../import";
import { ContactService } from "./ContactService";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { OrganisationService } from "../organisation";

export class ContactImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, 1)
        );
    }

    protected getSpecificObject(object: {}): Contact {
        return new Contact(object as Contact);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case ContactProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: ContactProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case ContactProperty.COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        const attributes = [
            ContactProperty.PASSWORD,
            ContactProperty.PRIMARY_ORGANISATION_ID,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.TITLE,
            ContactProperty.EMAIL,
            ContactProperty.PHONE,
            ContactProperty.MOBILE,
            ContactProperty.FAX,
            ContactProperty.STREET,
            ContactProperty.CITY,
            ContactProperty.ZIP,
            ContactProperty.COUNTRY,
            ContactProperty.COMMENT,
            KIXObjectProperty.VALID_ID
        ];
        for (const attribute of attributes) {
            const label = await labelProvider.getPropertyText(attribute);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [ContactProperty.LOGIN, ContactProperty.PRIMARY_ORGANISATION_ID];
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                const filter = await OrganisationService.getInstance().prepareFullTextFilter(searchValue);
                const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, null, loadingOptions, null, false
                );

                const nodes = [];
                for (const o of organisations) {
                    const displayValue = await LabelService.getInstance().getText(o);
                    nodes.push(new TreeNode(o.ID, displayValue, new ObjectIcon(o.KIXObjectType, o.ID)));
                }
                return nodes;
            default:
        }

        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await ContactService.getInstance().getTreeNodes(property);
    }
}
