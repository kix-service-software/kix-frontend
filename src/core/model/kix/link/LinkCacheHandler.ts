import { IKIXObjectCacheHandler } from "../../IKIXObjectCacheHandler";
import { KIXObjectType } from "../KIXObjectType";
import { ServiceMethod } from "../../../browser";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { CreateLinkObjectOptions } from "./CreateLinkObjectOptions";
import { KIXObjectCache } from "../../KIXObjectCache";

export class LinkCacheHandler implements IKIXObjectCacheHandler {
    public updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        if (objectType === KIXObjectType.LINK_OBJECT) {
            switch (method) {
                case ServiceMethod.CREATE:
                    if (options && (options instanceof CreateLinkObjectOptions)) {
                        const object = (options as CreateLinkObjectOptions).rootObject;
                        KIXObjectCache.removeObject(object.KIXObjectType, object.ObjectId);
                    }

                    if (parameter) {
                        const objectIdParameter = parameter.find((p) => p[0] === 'ObjectId');
                        const objectTypeParameter = parameter.find((p) => p[0] === 'KIXObjectType');

                        if (objectIdParameter && objectTypeParameter) {
                            KIXObjectCache.removeObject(objectTypeParameter[1], objectIdParameter[1]);
                        }
                    }

                    break;
                default:
            }
        }
    }

}
