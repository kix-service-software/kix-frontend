import { ConfigurationService, LoggingService } from "../services";
import { ICache } from "../model";
import { MemcachedConfiguration } from "./MemcachedConfiguration";

export class Memcached implements ICache {

    private static INSTANCE: Memcached;

    public static getInstance(): Memcached {
        if (!Memcached.INSTANCE) {
            Memcached.INSTANCE = new Memcached();
        }
        return Memcached.INSTANCE;
    }

    private memCached: any;

    private keyIndex: Map<string, string[]> = new Map();

    private constructor() {
        this.init();
    }

    public async init(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.MEMCACHED && process.env.NODE_ENV !== 'test') {
            const MemcachedInstance = require('memcached');
            const config = serverConfig.MEMCACHED;
            this.memCached = new MemcachedInstance(config.Servers, config.Parameters);
        }
    }

    public async clear(): Promise<void> {
        const iterator = this.keyIndex.keys();

        let key = iterator.next();
        while (key && key.value) {
            await this.delete(key.value, null);
            key = iterator.next();
        }
    }

    public async has(key: string): Promise<boolean> {
        const hasKey = await new Promise<boolean>((resolve, reject) => {
            this.memCached.get(key, (error, data) => {
                if (typeof data !== 'undefined') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
        return hasKey;
    }

    public async get(key: string): Promise<any> {
        const cachedData = await new Promise<boolean>((resolve, reject) => {
            this.memCached.get(key, (error, data) => {
                if (!error) {
                    resolve(data);
                } else {
                    reject();
                }
            });
        });
        return cachedData;
    }

    public async set(key: string, cacheKeyPrefix: string, value: any): Promise<void> {
        await new Promise<boolean>((resolve, reject) => {
            this.memCached.set(key, value, (60 * 60 * 24), (error) => {
                if (!error) {
                    if (cacheKeyPrefix) {
                        if (!this.keyIndex.has(cacheKeyPrefix)) {
                            this.keyIndex.set(cacheKeyPrefix, []);
                        }
                        this.keyIndex.get(cacheKeyPrefix).push(key);
                    }
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public async delete(key: string, cacheKeyPrefix: string): Promise<void> {
        await new Promise<boolean>((resolve, reject) => {
            this.memCached.delete(key, (error) => {
                if (!error) {
                    if (cacheKeyPrefix) {
                        if (!this.keyIndex.has(cacheKeyPrefix)) {
                            const keys = this.keyIndex.get(cacheKeyPrefix);
                            const index = keys.findIndex((k) => k === key);
                            if (index !== -1) {
                                keys.splice(index, 1);
                            }
                        }
                    }
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        if (this.keyIndex.has(cacheKeyPrefix)) {
            const keys = this.keyIndex.get(cacheKeyPrefix);
            LoggingService.getInstance().debug(
                `Memcached: delete cacheKeyPrefix ${cacheKeyPrefix} - key count: ${keys.length}`
            );
            for (const key of keys) {
                await this.delete(key, cacheKeyPrefix);
            }
        }
    }

}
