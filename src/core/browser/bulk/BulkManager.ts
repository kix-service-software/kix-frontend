import {
    KIXObjectType, InputFieldTypes, TreeNode, KIXObject
} from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { PropertyOperator } from "../PropertyOperator";
import { KIXObjectService } from "../kix";

export abstract class BulkManager {

    public abstract objectType: KIXObjectType = KIXObjectType.ANY;
    public objects: KIXObject[] = [];

    protected bulkValues: ObjectPropertyValue[] = [];
    private bulkRun: boolean = false;

    protected listeners: Map<string, () => void> = new Map();

    public registerListener(listenerId: string, callback: () => void): void {
        this.listeners.set(listenerId, callback);
    }

    protected notifyListeners(): void {
        this.listeners.forEach((listener: () => void) => listener());
    }

    public init(): void {
        this.reset();
        this.bulkRun = false;
    }

    public reset(): void {
        this.bulkValues = [];
    }

    public getBulkValues(): ObjectPropertyValue[] {
        return this.bulkValues;
    }

    public getBulkRunState() {
        return this.bulkRun;
    }

    public hasDefinedValues(): boolean {
        return this.bulkValues.some(
            (bv) => bv.property !== null && bv.operator !== null && bv.value !== null
        );
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
        this.notifyListeners();
    }

    public async removeValue(bulkValue: ObjectPropertyValue): Promise<void> {
        const index = this.bulkValues.findIndex((bv) => bv.property === bulkValue.property);
        if (index !== -1) {
            this.bulkValues.splice(index, 1);
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

    public async execute(object: KIXObject): Promise<void> {
        this.bulkRun = true;
        const parameter: Array<[string, any]> = [];

        const values = this.getEditableValues();
        values.forEach((v) => parameter.push([v.property, v.operator === PropertyOperator.CLEAR ? null : v.value]));
        await KIXObjectService.updateObject(this.objectType, parameter, object.ObjectId);
    }

    public getEditableValues(): ObjectPropertyValue[] {
        let values: ObjectPropertyValue[] = [];

        values = [...this.bulkValues.filter((bv) => bv.operator === PropertyOperator.CLEAR)];

        values = [
            ...values,
            ...this.bulkValues
                .filter((bv) => bv.operator === PropertyOperator.CHANGE)
                .filter((bv) => bv.property !== null && bv.value !== null && bv.value !== undefined)
        ];

        return values;
    }

}
