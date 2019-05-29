import { IKIXObjectFactory } from "./IKIXObjectFactory";
import { KIXObject, Permission } from "../../model";

export abstract class KIXObjectFactory<T extends KIXObject> implements IKIXObjectFactory<T> {

    public abstract create(object: T): Promise<T>;

    public createPermissions(object: T): void {
        if (object.ConfiguredPermissions && !Array.isArray(object.ConfiguredPermissions)) {
            if (object.ConfiguredPermissions.Assigned) {
                object.ConfiguredPermissions.Assigned = object.ConfiguredPermissions.Assigned.map(
                    (p) => new Permission(p)
                );
            }

            if (object.ConfiguredPermissions.DependingObjects) {
                object.ConfiguredPermissions.DependingObjects = object.ConfiguredPermissions.DependingObjects.map(
                    (p) => new Permission(p)
                );
            }
        }
    }
}
