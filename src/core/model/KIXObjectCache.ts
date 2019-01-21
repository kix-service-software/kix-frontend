import { ServiceMethod } from "../browser";
import { KIXObjectType, KIXObject, Service } from "./kix";
import { IKIXObjectCacheHandler } from "./IKIXObjectCacheHandler";
import { KIXObjectSpecificCreateOptions } from "./KIXObjectSpecificCreateOptions";
import { KIXObjectSpecificDeleteOptions } from "./KIXObjectSpecificDeleteOptions";

export class KIXObjectCache {

    private static INSTANCE: KIXObjectCache;

    private static getInstance(): KIXObjectCache {
        if (!KIXObjectCache.INSTANCE) {
            KIXObjectCache.INSTANCE = new KIXObjectCache();
        }
        return KIXObjectCache.INSTANCE;
    }

    private constructor() { }

    private cacheHandler: IKIXObjectCacheHandler[] = [];

    private objectCache: Map<KIXObjectType, KIXObject[]> = new Map();

    public static registerCacheHandler(handler: IKIXObjectCacheHandler): void {
        KIXObjectCache.getInstance().cacheHandler.push(handler);
    }

    public static getObjectCache<T extends KIXObject>(objectType: KIXObjectType): T[] {
        if (this.hasObjectCache(objectType)) {
            return [...KIXObjectCache.getInstance().objectCache.get(objectType)] as T[];
        }

        return [];
    }

    public static getObject<T extends KIXObject>(objectType: KIXObjectType, objectId: string | number): T {
        const cache = KIXObjectCache.getInstance();
        let object;
        if (objectId && cache.objectCache.has(objectType)) {
            object = cache.objectCache.get(objectType).find((o) => o.ObjectId.toString() === objectId.toString());
        }
        return object;
    }

    public static addObject(objectType: KIXObjectType, object: KIXObject): void {
        const cache = KIXObjectCache.getInstance();
        if (!cache.objectCache.has(objectType)) {
            cache.objectCache.set(objectType, []);
        }

        const index = cache.objectCache.get(objectType)
            .findIndex((o) => o.ObjectId.toString() === object.ObjectId.toString());

        if (index !== -1) {
            cache.objectCache.get(objectType).splice(index, 1);
        }

        cache.objectCache.get(objectType).push(object);
    }

    public static removeObject(objectType: KIXObjectType, objectId: string | number): void {
        const cache = KIXObjectCache.getInstance();
        if (objectId && cache.objectCache.has(objectType)) {
            const index = cache.objectCache.get(objectType).findIndex(
                (obj) => obj.ObjectId.toString() === objectId.toString()
            );
            if (index !== -1) {
                cache.objectCache.get(objectType).splice(index, 1);
            }
        }
    }

    public static clearCache(objectType: KIXObjectType): void {
        const cache = KIXObjectCache.getInstance();
        if (cache.objectCache.has(objectType)) {
            cache.objectCache.delete(objectType);
        }
    }

    public static getCachedObjects(objectType: KIXObjectType, objectIds: Array<string | number>): KIXObject[] {
        const cache = KIXObjectCache.getInstance();
        let objects = [];
        if (cache.objectCache.has(objectType)) {
            objects = cache.objectCache.get(objectType)
                .filter((o) => objectIds.some((oid) => o.ObjectId.toString() === oid.toString()));
        }
        return objects;
    }

    public static getIdsToLoad(objectType: KIXObjectType, objectIds: Array<string | number>): Array<string | number> {
        const cache = KIXObjectCache.getInstance();
        let ids = objectIds;
        if (cache.objectCache.has(objectType)) {
            const objects = cache.objectCache.get(objectType);
            ids = objectIds.filter((oid) => !objects.some((o) => o.ObjectId.toString() === oid.toString()));
        }
        return ids;
    }

    public static hasObjectCache(objectType: KIXObjectType): boolean {
        return KIXObjectCache.getInstance().objectCache.has(objectType);
    }

    public static isObjectCached(objectType: KIXObjectType, objectId: string | number): boolean {
        const cache = KIXObjectCache.getInstance();
        if (objectId && cache.objectCache.has(objectType)) {
            return cache.objectCache.get(objectType).some((o) => o.ObjectId.toString() === objectId.toString());
        }
        return false;
    }

    public static updateCache(
        objectType: KIXObjectType, objectId: string | number, method: ServiceMethod,
        parameter?: Array<[string, any]>, options?: KIXObjectSpecificCreateOptions | KIXObjectSpecificDeleteOptions
    ): void {
        KIXObjectCache.getInstance().cacheHandler.forEach(
            (ch) => ch.updateCache(objectType, objectId, method, parameter, options)
        );
    }

}
