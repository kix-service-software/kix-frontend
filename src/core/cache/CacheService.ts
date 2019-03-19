import { ConfigurationService, LoggingService } from "../services";
import { Memcached } from "./Memcached";
import { InMemoryCache } from "./InMemoryCache";
import { ObjectUpdatedEventData, KIXObjectType } from "../model";

export class CacheService {

    private static INSTANCE: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.INSTANCE) {
            CacheService.INSTANCE = new CacheService();
        }
        return CacheService.INSTANCE;
    }

    private useMemcached: boolean = false;
    private useInMemoryCache: boolean = false;

    private constructor() { }

    public init(): void {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.USE_MEMCACHED && serverConfig.MEMCACHED) {
            this.useMemcached = true;
            Memcached.getInstance();
        }

        if (serverConfig.USE_IN_MEMORY_CACHE) {
            this.useInMemoryCache = true;
        }
    }

    public async has(key: string, cacheKeyPrefix?: string): Promise<boolean> {
        key = this.hashCode(key, cacheKeyPrefix);
        if (process.env.NODE_ENV === 'test') {
            return false;
        } else if (this.useMemcached) {
            return await Memcached.getInstance().has(key);
        } else if (this.useInMemoryCache) {
            return await InMemoryCache.getInstance().has(key);
        }

        return false;
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        key = this.hashCode(key, cacheKeyPrefix);
        if (this.useMemcached) {
            return await Memcached.getInstance().get(key);
        } else if (this.useInMemoryCache) {
            return await InMemoryCache.getInstance().get(key);
        }
        return null;
    }

    public async set(key: string, value: any, cacheKeyPrefix?: string): Promise<void> {
        key = this.hashCode(key, cacheKeyPrefix);
        if (this.useMemcached) {
            await Memcached.getInstance().set(key, cacheKeyPrefix, value);
        } else if (this.useInMemoryCache) {
            await InMemoryCache.getInstance().set(key, cacheKeyPrefix, value);
        }
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

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
            await this.deleteKeys(event.Namespace);
        }
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const prefixes = this.getCacheKeyPrefixes(cacheKeyPrefix);
        for (const prefix of prefixes) {
            if (this.useMemcached) {
                await Memcached.getInstance().deleteKeys(prefix);
            } else if (this.useInMemoryCache) {
                await InMemoryCache.getInstance().deleteKeys(prefix);
            }
        }
    }

    private getCacheKeyPrefixes(objectNamespace: string): string[] {
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

}
