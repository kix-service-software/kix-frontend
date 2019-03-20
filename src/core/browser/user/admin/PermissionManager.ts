import { KIXObjectType, InputFieldTypes, TreeNode, SortUtil } from "../../../model";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";
import { LabelService } from "../../LabelService";

export class PermissionManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION;

    protected permissionValues: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public registerListener(listenerId: string, callback: () => void): void {
        if (listenerId) {
            this.listeners.set(listenerId, callback);
        }
    }

    public unregisterListener(listenerId: string): void {
        if (listenerId) {
            this.listeners.delete(listenerId);
        }
    }

    protected notifyListeners(): void {
        this.listeners.forEach((listener: () => void) => listener());
    }

    public init(): void {
        this.reset();
    }

    public reset(): void {
        this.permissionValues = [];
    }

    public hasDefinedValues(): boolean {
        return !!this.getEditableValues().length;
    }

    public async setValue(permissionValue: ObjectPropertyValue): Promise<void> {
        const index = this.permissionValues.findIndex((bv) => bv.id === permissionValue.id);
        if (index !== -1) {
            this.permissionValues[index].property = permissionValue.property;
            this.permissionValues[index].operator = permissionValue.operator;
            this.permissionValues[index].value = permissionValue.value;
        } else {
            this.permissionValues.push(permissionValue);
        }

        this.notifyListeners();
    }

    public async removeValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.permissionValues.findIndex((bv) => bv.property === importValue.property);
        if (index !== -1) {
            this.permissionValues.splice(index, 1);
        }

        this.notifyListeners();
    }

    public getValues(): ObjectPropertyValue[] {
        return this.permissionValues;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.CHECKBOX_GROUPS;
    }

    public async getInputTypeOptions(property: string): Promise<Array<[string, string | number]>> {
        return [];
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
        // TODO: Persmissiontypes holen
        const attributes = [
            'resource', 'object', 'queue -> ticket'
        ];
        for (const attribute of attributes) {
            const label = await labelProvider.getPropertyText(attribute);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return [];
    }

    public hasValueForProperty(property: string): boolean {
        return this.permissionValues.some((bv) => bv.property === property);
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        return [];
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.permissionValues];
    }
}
