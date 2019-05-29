import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export interface IObjectFactory<T extends KIXObject = any> {

    isFactoryFor(objectType: KIXObjectType): boolean;

    create(object?: T): T;

}
