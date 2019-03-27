import { KIXObjectType, InputFieldTypes, TreeNode } from "../../../model";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";
import { IDynamicFormManager, DynamicFormAutocompleteDefinition, DynamicFormOperationsType } from "../../form";

export abstract class AbstractDynamicFormManager implements IDynamicFormManager {

    public abstract objectType: KIXObjectType = KIXObjectType.ANY;

    protected values: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public abstract async getProperties(): Promise<Array<[string, string]>>;

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
        this.values = [];
    }

    public hasDefinedValues(): boolean {
        return !!this.getEditableValues().length;
    }

    public async setValue(newValue: ObjectPropertyValue): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === newValue.id);
        if (index !== -1) {
            this.values[index].property = newValue.property;
            this.values[index].operator = newValue.operator;
            this.values[index].value = newValue.value;
        } else {
            this.values.push(newValue);
        }

        await this.checkProperties();
        this.notifyListeners();
    }

    public async removeValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.values.findIndex((bv) => bv.id === importValue.id);
        if (index !== -1) {
            this.values.splice(index, 1);
        }

        await this.checkProperties();
        this.notifyListeners();
    }

    protected async checkProperties(): Promise<void> {
        return;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public getValues(): ObjectPropertyValue[] {
        return this.values;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return;
    }

    public getSpecificInput(): string {
        return;
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        return [];
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return '';
    }

    public async propertiesAreUnique(): Promise<boolean> {
        return true;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return [];
    }

    public hasValueForProperty(property: string): boolean {
        return this.values.some((bv) => bv.property === property);
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return '';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return;
    }

    public async getOperationsAutoCompleteData(): Promise<DynamicFormAutocompleteDefinition> {
        return null;
    }

    public getOperatorDisplayText(operator: string): string {
        return operator;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        return [];
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values];
    }
}
