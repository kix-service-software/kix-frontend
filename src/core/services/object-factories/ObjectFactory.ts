import { IObjectFactory } from "./IObjectFactory";
import { KIXObject, KIXObjectType, CRUD } from "../../model";
import { PermissionService } from "../../../services";
import { UIComponentPermission } from "../../model/UIComponentPermission";

export abstract class ObjectFactory<T extends KIXObject = any> implements IObjectFactory<T> {

    public abstract isFactoryFor(objectType: KIXObjectType): boolean;

    public abstract create(object?: T): T;

    public async applyPermissions(token: string, object: T): Promise<T> {
        return object;
    }

    protected async readAccessDenied(token: string, resource: string): Promise<boolean> {
        const allowed = await PermissionService.getInstance().checkPermissions(
            token, [new UIComponentPermission(resource, [CRUD.READ])]
        );
        return !allowed;
    }

}
