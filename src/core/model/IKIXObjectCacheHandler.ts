import { KIXObjectType } from "./kix";
import { ServiceMethod } from "../browser";
import { KIXObjectSpecificDeleteOptions } from "./KIXObjectSpecificDeleteOptions";
import { KIXObjectSpecificCreateOptions } from "./KIXObjectSpecificCreateOptions";

export interface IKIXObjectCacheHandler {

    updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void;

}
