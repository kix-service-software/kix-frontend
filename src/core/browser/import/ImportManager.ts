import { InputFieldTypes, KIXObject, Error } from "../../model";
import { ObjectPropertyValue } from "../ObjectPropertyValue";
import { ImportPropertyOperator } from "./ImportPropertyOperator";
import { KIXObjectService } from "../kix";
import { LabelService } from "../LabelService";
import { IColumn } from "../table";
import { AbstractDynamicFormManager } from "../form";
import { ImportPropertyOperatorUtil } from "./ImportPropertyOperatorUtil";

export abstract class ImportManager extends AbstractDynamicFormManager {

    public objects: KIXObject[] = [];

    private importRun: boolean = false;

    protected abstract getSpecificObject(object: {}): KIXObject;

    public init(): void {
        this.reset();
        this.importRun = false;
    }

    public getObject(object: {}): KIXObject {
        const specificObject = this.getSpecificObject(object);
        specificObject['CSV_LINE'] = object['CSV_LINE'];
        specificObject.equals = (tableObject: KIXObject) => {
            return tableObject && tableObject['CSV_LINE'] === specificObject['CSV_LINE'];
        };
        return specificObject;
    }

    public getImportRunState(): boolean {
        return this.importRun;
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

    public getOperatorDisplayText(operator: ImportPropertyOperator): string {
        return ImportPropertyOperatorUtil.getText(operator);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return value.property && value.operator && value.operator !== ImportPropertyOperator.IGNORE;
    }

    public getEditableValues(): ObjectPropertyValue[] {
        return [...this.values.filter(
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
                await KIXObjectService.updateObject(this.objectType, parameter, existingObject.ObjectId, false);
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
