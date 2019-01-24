import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { KIXObjectType } from "../KIXObjectType";
import { ServiceMethod } from "../../../browser";
import { KIXObjectCache } from "../../KIXObjectCache";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class TranslationCacheHandler implements IKIXObjectCacheHandler {

    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.TRANSLATION) {
            switch (method) {
                case ServiceMethod.CREATE:
                case ServiceMethod.UPDATE:
                case ServiceMethod.DELETE:
                    KIXObjectCache.clearCache(KIXObjectType.TRANSLATION);
                    break;
                default:
            }
        }
    }

}
