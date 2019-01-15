import {
    KIXObjectType, InputFieldTypes, TreeNode, KIXObject
} from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { PropertyOperator } from "../PropertyOperator";

export abstract class BulkManager {

    public abstract objectType: KIXObjectType = KIXObjectType.ANY;
    public objects: KIXObject[] = [];

    protected bulkValues: ObjectPropertyValue[] = [];

    public reset(): void {
        this.bulkValues = [];
    }

    public getBulkValues(): ObjectPropertyValue[] {
        return this.bulkValues;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [];
    }

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        return [
            PropertyOperator.CHANGE,
            PropertyOperator.CLEAR
        ];
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public hasValueForProperty(property: string): boolean {
        return this.bulkValues.some((bv) => bv.property === property);
    }

    public async setValue(bulkValue: ObjectPropertyValue): Promise<void> {
        const index = this.bulkValues.findIndex((bv) => bv.id === bulkValue.id);
        if (index !== -1) {
            this.bulkValues[index].property = bulkValue.property;
            this.bulkValues[index].operator = bulkValue.operator;
            this.bulkValues[index].value = bulkValue.value;
        } else {
            this.bulkValues.push(bulkValue);
        }

        await this.checkProperties();
    }

    public async removeValue(bulkValue: ObjectPropertyValue): Promise<void> {
        const index = this.bulkValues.findIndex((bv) => bv.property === bulkValue.property);
        if (index !== -1) {
            this.bulkValues.splice(index, 1);
        }

        await this.checkProperties();
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

}
