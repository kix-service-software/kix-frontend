import { ICache } from "../model";
import { LoggingService } from "../services";

export class InMemoryCache implements ICache {

    private static INSTANCE: InMemoryCache;

    public static getInstance(): InMemoryCache {
        if (!InMemoryCache.INSTANCE) {
            InMemoryCache.INSTANCE = new InMemoryCache();
        }
        return InMemoryCache.INSTANCE;
    }

    private cache: Map<string, any> = new Map();

    private keyIndex: Map<string, string[]> = new Map();

    private constructor() { }

    public async clear(): Promise<void> {
        this.cache.clear();
        this.keyIndex.clear();
        LoggingService.getInstance().debug(
            `InMemoryCache: cache cleared`
        );
    }

    public async has(key: string): Promise<boolean> {
        return this.cache.has(key);
    }

    public async get(key: string): Promise<any> {
        return this.cache.get(key);
    }

    public async set(key: string, cacheKeyPrefix: string, value: any): Promise<void> {
        if (cacheKeyPrefix) {
            if (!this.keyIndex.has(cacheKeyPrefix)) {
                this.keyIndex.set(cacheKeyPrefix, []);
            }
            this.keyIndex.get(cacheKeyPrefix).push(key);
        }
        this.cache.set(key, value);
    }

    public async delete(key: string, cacheKeyPrefix: string): Promise<void> {
        if (cacheKeyPrefix) {
            if (!this.keyIndex.has(cacheKeyPrefix)) {
                const keys = this.keyIndex.get(cacheKeyPrefix);
                const index = keys.findIndex((k) => k === key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
        this.cache.delete(key);
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        if (this.keyIndex.has(cacheKeyPrefix)) {
            const keys = this.keyIndex.get(cacheKeyPrefix);
            LoggingService.getInstance().debug(
                `InMemoryCache: delete cacheKeyPrefix ${cacheKeyPrefix} - key count: ${keys.length}`
            );
            for (const key of keys) {
                await this.delete(key, cacheKeyPrefix);
            }
        }
    }

}
