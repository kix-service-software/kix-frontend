import { ObjectUpdatedEventData, KIXObjectType } from "../../model";
import { ClientStorageService } from "../ClientStorageService";

export class CacheService {

    private static INSTANCE: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.INSTANCE) {
            CacheService.INSTANCE = new CacheService();
        }
        return CacheService.INSTANCE;
    }

    private constructor() { }

    private cache: Map<string, any> = new Map();

    private keyIndex: Map<string, string[]> = new Map();

    public async has(key: string, cacheKeyPrefix?: string): Promise<boolean> {
        key = this.hashCode(key, cacheKeyPrefix);
        return this.cache.has(key);
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        key = this.hashCode(key, cacheKeyPrefix);
        return this.cache.get(key);
    }

    public async set(key: string, value: any, cacheKeyPrefix?: string): Promise<void> {
        key = this.hashCode(key, cacheKeyPrefix);
        this.cache.set(key, value);
        if (cacheKeyPrefix) {
            if (!this.keyIndex.has(cacheKeyPrefix)) {
                this.keyIndex.set(cacheKeyPrefix, []);
            }
            this.keyIndex.get(cacheKeyPrefix).push(key);
        }
    }

    public async delete(key: string, cacheKeyPrefix: string): Promise<void> {
        this.cache.delete(key);
        if (cacheKeyPrefix) {
            if (!this.keyIndex.has(cacheKeyPrefix)) {
                const keys = this.keyIndex.get(cacheKeyPrefix);
                const index = keys.findIndex((k) => k === key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const prefixes = this.getCacheKeyPrefix(cacheKeyPrefix);
        for (const prefix of prefixes) {
            if (this.keyIndex.has(prefix)) {
                const keys = this.keyIndex.get(prefix);
                console.debug(
                    `CacheService: delete cacheKeyPrefix ${prefix} - key count: ${keys.length}`
                );
                for (const key of keys) {
                    await this.delete(key, prefix);
                }
            }
        }
    }

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            if (event.RequestID !== ClientStorageService.getClientRequestId()) {
                await this.deleteKeys(event.Namespace);
            }
        }
    }

    private getCacheKeyPrefix(objectNamespace: string): string[] {
        const cacheKeyPrefixes: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                cacheKeyPrefixes.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
            } else {
                cacheKeyPrefixes.push(namespace[0]);
            }
        } else {
            cacheKeyPrefixes.push(objectNamespace);
        }

        switch (cacheKeyPrefixes[0]) {
            case KIXObjectType.TICKET:
                cacheKeyPrefixes.push(KIXObjectType.CUSTOMER);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.QUEUE_HIERARCHY);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY_HIERARCHY);
                break;
            case KIXObjectType.CONFIG_ITEM_CLASS:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM_CLASS);
                break;
            default:
        }

        return cacheKeyPrefixes;
    }

    private hashCode(value: string, cacheKeyPrefix?: string): string {
        let prefix = '';
        if (cacheKeyPrefix && cacheKeyPrefix.length) {
            prefix = `${cacheKeyPrefix};`;
        }

        let hash = 0;
        let i: number;
        let chr: number;
        let len: number;
        if (value && value.length === 0) {
            return `${prefix}${hash}`;
        }

        for (i = 0, len = value.length; i < len; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }

        return `${prefix}${hash}`;
    }

}
