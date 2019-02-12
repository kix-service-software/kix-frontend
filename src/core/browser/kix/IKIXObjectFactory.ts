import { KIXObject } from "../../model";

export interface IKIXObjectFactory<T extends KIXObject> {

    create(object: T): Promise<T>;

}
