import {
    KIXObjectType, InputFieldTypes, TreeNode, SortUtil,
    PermissionType
} from "../../../model";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";
import { IDynamicFormManager, DynamicFormAutocompleteDefinition } from "../../form";
import { KIXObjectService } from "../../kix";

export class PermissionManager implements IDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

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
        const index = this.permissionValues.findIndex((bv) => bv.id === importValue.id);
        if (index !== -1) {
            this.permissionValues.splice(index, 1);
        }

        this.notifyListeners();
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public getValues(): ObjectPropertyValue[] {
        return this.permissionValues;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        return [];
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const permissionTypes = await KIXObjectService.loadObjects<PermissionType>(this.objectType);
        for (const permissionType of permissionTypes) {
            properties.push([permissionType.ID.toString(), permissionType.Name]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Type';
    }

    public async propertiesAreUnique(): Promise<boolean> {
        return false;
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

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Path';
    }

    public async opertationIsAutocompete(property: string): Promise<boolean> {
        return false;
    }

    public async operationIsStringInput(property: string): Promise<boolean> {
        return true;
    }

    public async getAutoCompleteData(): Promise<DynamicFormAutocompleteDefinition> {
        return null;
    }

    public getOperatorDisplayText(operator: string): string {
        return operator;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        return [];
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.permissionValues];
    }
}
