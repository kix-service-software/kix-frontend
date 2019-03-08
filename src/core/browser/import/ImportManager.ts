import {
    KIXObjectType, InputFieldTypes, TreeNode, KIXObject
} from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportPropertyOperator } from "./ImportPropertyOperator";

export abstract class ImportManager {

    public abstract objectType: KIXObjectType = KIXObjectType.ANY;
    public objects: KIXObject[] = [];

    protected importValues: ObjectPropertyValue[] = [];

    protected listeners: Map<string, () => void> = new Map();

    public abstract getObject(object: {}): KIXObject;

    public registerListener(listenerId: string, callback: () => void): void {
        this.listeners.set(listenerId, callback);
    }

    protected notifyListeners(): void {
        this.listeners.forEach((listener: () => void) => listener());
    }

    public init(): void {
        this.reset();
    }

    public reset(): void {
        this.importValues = [];
    }

    public getValues(): ObjectPropertyValue[] {
        return this.importValues;
    }

    public hasDefinedValues(): boolean {
        return !!this.getEditableValues().length;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [];
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [];
    }

    public async getKnownProperties(): Promise<string[]> {
        const requiredProperties = await this.getRequiredProperties();
        return [
            ...requiredProperties,
            ...(await this.getProperties()).map((p) => p[0]).filter((p) => !requiredProperties.some((rp) => rp === p))
        ];
    }

    public async getOperations(property: string): Promise<ImportPropertyOperator[]> {
        return [
            ImportPropertyOperator.REPLACE_EMPTY,
            ImportPropertyOperator.FORCE,
            ImportPropertyOperator.IGNORE
        ];
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public async getInputTypeOptions(property: string): Promise<Array<[string, string | number]>> {
        return [];
    }

    public hasValueForProperty(property: string): boolean {
        return this.importValues.some((bv) => bv.property === property);
    }

    public async setValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.importValues.findIndex((bv) => bv.id === importValue.id);
        if (index !== -1) {
            this.importValues[index].property = importValue.property;
            this.importValues[index].operator = importValue.operator;
            this.importValues[index].value = importValue.value;
        } else {
            this.importValues.push(importValue);
        }

        await this.checkProperties();
        this.notifyListeners();
    }

    public async removeValue(importValue: ObjectPropertyValue): Promise<void> {
        const index = this.importValues.findIndex((bv) => bv.property === importValue.property);
        if (index !== -1) {
            this.importValues.splice(index, 1);
        }

        await this.checkProperties();
        this.notifyListeners();
    }

    protected async checkProperties(): Promise<void> {
        return;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return [];
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.importValues.filter(
            (bv) => bv.operator === ImportPropertyOperator.IGNORE
                || bv.property !== null
        )];
    }

}
