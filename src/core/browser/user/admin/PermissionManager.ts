import { KIXObjectType, InputFieldTypes } from "../../../model";
import { DynamicFormOperationsType, AbstractDynamicFormManager } from "../../form";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";

export class PermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [["1", "Resource"]];
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Type';
    }

    public async propertiesAreUnique(): Promise<boolean> {
        return false;
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Target';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.STRING;
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }
}
