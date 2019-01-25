import { KIXObjectType, KIXObject } from "./kix";

export interface IKIXObjectCacheListener {

    cacheCleared(objectType: KIXObjectType): void;

    objectAdded(objectType: KIXObjectType, objectId: KIXObject): void;

    objectRemoved(objectType: KIXObjectType, object: string | number): void;

}
