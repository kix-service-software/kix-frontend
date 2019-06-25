import { KIXObjectType, KIXObject } from "../../model";

export interface IObjectFactory<T extends KIXObject = any> {

    isFactoryFor(objectType: KIXObjectType): boolean;

    create(object?: T): T;

    applyPermissions(token: string, object: T): Promise<T>;

}
