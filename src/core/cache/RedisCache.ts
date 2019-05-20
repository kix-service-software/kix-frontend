import { ICache } from "../model";
import { promisify } from 'util';
import { RedisClient } from "redis";
import { ConfigurationService, LoggingService } from "../services";

export class RedisCache implements ICache {

    private static INSTANCE: RedisCache;

    private KIX_CACHE_PREFIX = 'KIXWebAPP';

    public static getInstance(): RedisCache {
        if (!RedisCache.INSTANCE) {
            RedisCache.INSTANCE = new RedisCache();
        }
        return RedisCache.INSTANCE;
    }

    private redisClient: RedisClient;

    private getAsync: (key: string) => Promise<string>;
    private setAsync: (key: string, value: string) => Promise<void>;
    private delAsync: (key: string) => Promise<void>;
    private keysAsync: (pattern: string) => Promise<string[]>;
    private flushAllAsync: () => Promise<boolean>;

    private constructor() {

        const config = ConfigurationService.getInstance().getServerConfiguration();

        const port = config.REDIS_CACHE_PORT;
        const host = config.REDIS_CACHE_HOST;

        const redis = require("redis");
        this.redisClient = redis.createClient(port, host);

        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
        this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
        this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
        this.keysAsync = promisify(this.redisClient.keys).bind(this.redisClient);
        this.flushAllAsync = promisify(this.redisClient.flushall).bind(this.redisClient);
    }

    public async clear(ignoreKeyPrefixes?: string[]): Promise<void> {
        let keys = await this.keysAsync(`${this.KIX_CACHE_PREFIX}::*`);
        keys = keys.filter((k) => !ignoreKeyPrefixes.some((p) => k.startsWith(`${this.KIX_CACHE_PREFIX}::${p}`)));
        for (const key of keys) {
            await this.delete(key);
        }
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        let value = await this.getAsync(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::${key}`);

        try {
            value = JSON.parse(value);
            // tslint:disable-next-line:no-empty
        } catch (error) { }

        return value;
    }

    public async set(key: string, cacheKeyPrefix: string, value: any): Promise<void> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        await this.setAsync(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::${key}`, value);
    }

    public async delete(key: string, cacheKeyPrefix?: string): Promise<void> {
        await this.delAsync(key);
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const keys = await this.keysAsync(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::*`);
        LoggingService.getInstance().debug(
            `Redis Cache: delete cacheKeyPrefix ${cacheKeyPrefix} - key count: ${keys.length}`
        );
        keys.forEach((k) => this.delAsync(k));
    }

}
