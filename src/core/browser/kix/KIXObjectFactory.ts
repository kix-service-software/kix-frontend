import { IKIXObjectFactory } from "./IKIXObjectFactory";
import { KIXObject, Permission } from "../../model";

export abstract class KIXObjectFactory<T extends KIXObject> implements IKIXObjectFactory<T> {

    public abstract create(object: T): Promise<T>;

    public createPermissions(object: T): void {
        if (object.Permissions && !Array.isArray(object.Permissions)) {
            if (object.Permissions.Assigned) {
                object.Permissions.Assigned = object.Permissions.Assigned.map((p) => new Permission(p));
            }

            if (object.Permissions.DependingObjects) {
                object.Permissions.DependingObjects = object.Permissions.DependingObjects.map(
                    (p) => new Permission(p)
                );
            }
        }
    }
}
