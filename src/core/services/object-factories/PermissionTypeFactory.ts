import { PermissionType, KIXObjectType } from "../../model";
import { ObjectFactory } from "./ObjectFactory";

export class PermissionTypeFactory extends ObjectFactory<PermissionType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION_TYPE;
    }

    public create(permissionType?: PermissionType): PermissionType {
        return new PermissionType(permissionType);
    }

}
