import { KIXObjectType, InputFieldTypes, SortUtil, PermissionType } from "../../../model";
import { DynamicFormOperationsType, AbstractDynamicFormManager } from "../../form";
import { KIXObjectService } from "../../kix";

export class PermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
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

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Path';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.STRING;
    }
}
