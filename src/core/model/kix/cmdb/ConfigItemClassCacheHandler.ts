import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { KIXObjectType } from "../KIXObjectType";
import { ServiceMethod } from "../../../browser";
import { KIXObjectCache } from "../../KIXObjectCache";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class ConfigItemClassCacheHandler implements IKIXObjectCacheHandler {

    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        switch (method) {
            case ServiceMethod.CREATE:
            case ServiceMethod.UPDATE:
            case ServiceMethod.DELETE:
                KIXObjectCache.clearCache(KIXObjectType.CONFIG_ITEM_CLASS);
                // TODO: cache-Handling überarbeiten
                KIXObjectCache.clearCache(KIXObjectType.OBJECT_ICON);
                break;
            default:
        }
    }

}
