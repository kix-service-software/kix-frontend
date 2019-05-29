import { IObjectFactory } from "../IObjectFactory";
import { PermissionType } from "./PermissionType";
import { KIXObjectType } from "../KIXObjectType";


export class PermissionTypeFactory implements IObjectFactory<PermissionType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION_TYPE;
    }

    public create(permissionType?: PermissionType): PermissionType {
        return new PermissionType(permissionType);
    }

}
