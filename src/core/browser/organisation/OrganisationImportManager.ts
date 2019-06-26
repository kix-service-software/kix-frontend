import {
    KIXObjectType, InputFieldTypes, TreeNode, SortUtil, OrganisationProperty, Organisation, KIXObjectProperty,
    KIXObject, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType
} from "../../model";
import { LabelService } from "../LabelService";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportManager, ImportPropertyOperator } from "../import";
import { OrganisationService } from "./OrganisationService";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";

export class OrganisationImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, 1)
        );
    }

    protected getSpecificObject(object: {}): Organisation {
        return new Organisation(object as Organisation);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case OrganisationProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: OrganisationProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case OrganisationProperty.COMMENT:
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
            OrganisationProperty.NAME,
            OrganisationProperty.URL,
            OrganisationProperty.STREET,
            OrganisationProperty.CITY,
            OrganisationProperty.ZIP,
            OrganisationProperty.COUNTRY,
            OrganisationProperty.COMMENT,
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
        return [OrganisationProperty.NUMBER];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await OrganisationService.getInstance().getTreeNodes(property);
    }

    protected async getExisting(organisation: Organisation): Promise<KIXObject> {
        const filter = [
            new FilterCriteria(
                OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.AND, organisation.Number
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(filter);
        const organisations = await KIXObjectService.loadObjects(
            this.objectType, null, loadingOptions, null, true
        );
        return organisations && !!organisations.length ? organisations[0] : null;
    }
}
