import {
    KIXObjectType, InputFieldTypes, TreeNode, KIXObject, Error
} from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportPropertyOperator } from "./ImportPropertyOperator";
import { KIXObjectService } from "../kix";
import { LabelService } from "../LabelService";
import { IColumn } from "../table";

export abstract class ImportManager {

    public abstract objectType: KIXObjectType = KIXObjectType.ANY;
    public objects: KIXObject[] = [];

    protected importValues: ObjectPropertyValue[] = [];
    private importRun: boolean = false;

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
        this.importRun = false;
    }

    public reset(): void {
        this.importValues = [];
    }

    public getObject(object: {}): KIXObject {
        const specificObject = this.getSpecificObject(object);
        specificObject['CSV_LINE'] = object['CSV_LINE'];
        specificObject.equals = (tableObject: KIXObject) => {
            return tableObject && tableObject['CSV_LINE'] === specificObject['CSV_LINE'];
        };
        return specificObject;
    }

    protected abstract getSpecificObject(object: {}): KIXObject;

    public getValues(): ObjectPropertyValue[] {
        return this.importValues;
    }

    public getImportRunState(): boolean {
        return this.importRun;
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

    public async execute(object: KIXObject, columns: IColumn[]): Promise<void> {
        this.importRun = true;

        await this.checkObject(object).then(async () => {
            const existingObject = await this.getExisting(object);
            const parameter: Array<[string, any]> = await this.prepareParameter(object, columns);

            if (existingObject) {
                await KIXObjectService.updateObject(this.objectType, parameter, existingObject.ObjectId, false, false);
            } else {
                await KIXObjectService.createObject(this.objectType, parameter, null, false);
            }
        });
    }

    protected async checkObject(object: KIXObject): Promise<void> {
        const requiredProperties = await this.getRequiredProperties();
        for (const rp of requiredProperties) {
            if (typeof object[rp] === 'undefined' || object[rp] === null || object[rp] === '') {
                throw new Error(null, `Missing value for ${rp}`);
            }
        }
        return;
    }

    protected async getExisting(object: KIXObject): Promise<KIXObject> {
        const existingObjects = await KIXObjectService.loadObjects(
            this.objectType, [object.ObjectId], null, null, null, true
        );
        return existingObjects && !!existingObjects.length ? existingObjects[0] : null;
    }

    protected async prepareParameter(object: KIXObject, columns: IColumn[]): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        const knownProperties = await this.getKnownProperties();
        for (const prop in object) {
            if (
                prop && knownProperties.some((kp) => kp === prop)
                && columns.some((c) => c.getColumnId() === prop)
            ) {
                parameter.push([prop, object[prop]]);
            }
        }
        return parameter;
    }

    public async getIdentifierText(object: KIXObject): Promise<string> {
        return await LabelService.getInstance().getText(object);
    }
}
