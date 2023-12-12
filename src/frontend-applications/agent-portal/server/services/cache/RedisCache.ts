/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { promisify } from 'util';
import { RedisClient } from 'redis';
import { ICache } from './ICache';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { BackendNotification } from '../../../model/BackendNotification';

export class RedisCache implements ICache {

    private static INSTANCE: RedisCache;

    private KIX_CACHE_PREFIX = 'AgentPortal';

    public static getInstance(): RedisCache {
        if (!RedisCache.INSTANCE) {
            RedisCache.INSTANCE = new RedisCache();
        }
        return RedisCache.INSTANCE;
    }

    private redisClient: RedisClient;

    private delAsync: (type: string) => Promise<void>;
    private scanAsync: (cursor: any, match: string, pattern: string) => Promise<string[]>;
    private hgetAsync: (type: string, key: string) => Promise<string>;
    private hsetAsync: (type: string, key: string, value: string) => Promise<void>;
    private hdelAsync: (type: string, key: string) => Promise<void>;
    private hvalsAsync: (type: string) => Promise<any[]>;

    private constructor() {

        this.connect();

        this.redisClient.on('error', (err) => {
            LoggingService.getInstance().error('REDIS Error: ' + err);
        });

        this.redisClient.on('reconnecting', () => {
            LoggingService.getInstance().info('REDIS: Connection reestablished');
        });

        this.redisClient.on('connect', () => {
            LoggingService.getInstance().info('REDIS connecting');
        });

        this.redisClient.on('ready', (client) => {
            LoggingService.getInstance().info('REDIS ready');
        });
    }

    public async clear(ignoreKeyPrefixes: string[] = []): Promise<void> {
        LoggingService.getInstance().info('Clear Cache: (ignore) ' + ignoreKeyPrefixes.join(', '));
        let keys = await this.scan(`${this.KIX_CACHE_PREFIX}::*`);
        keys = keys.filter((k) => !ignoreKeyPrefixes.some((p) => k.startsWith(`${this.KIX_CACHE_PREFIX}::${p}`)));

        const deletePromises = [];
        for (const key of keys) {
            this.redisClient.del(key);
        }

        await Promise.all(deletePromises);
    }

    public async get(type: string, key: string): Promise<any> {
        let value = await this.hgetAsync(`${this.KIX_CACHE_PREFIX}::${type}`, key)
            .catch((error) => {
                LoggingService.getInstance().error(error);
                this.checkConnection();
                return null;
            });

        try {
            value = JSON.parse(value);
        } catch (error) {
            // do nothing ...
        }

        return value;
    }

    public async getAll(type: string): Promise<any[]> {
        const values = [];
        try {
            const cachedVvalues = await this.hvalsAsync(`${this.KIX_CACHE_PREFIX}::${type}`);
            if (Array.isArray(cachedVvalues)) {
                for (const v of cachedVvalues) {
                    try {
                        values.push(JSON.parse(v));
                        // tslint:disable-next-line:no-empty
                    } catch (error) {
                        // do nothing
                    }
                }
            }
        }
        catch (error) {
            LoggingService.getInstance().error(error);
            this.checkConnection();
            return null;
        }

        return values;
    }

    public async set(type: string, key: string, value: any): Promise<void> {
        if (typeof value === 'object') {
            try {
                value = JSON.stringify(value);
            } catch (e) {
                LoggingService.getInstance().error(`Error set cache for type: ${type} and key: ${key}`);
                LoggingService.getInstance().debug(e);
            }
        }

        await this.hsetAsync(`${this.KIX_CACHE_PREFIX}::${type}`, key, value)
            .catch(() => this.checkConnection());
    }

    public async delete(type: string, key: string): Promise<void> {
        await this.hdelAsync(`${this.KIX_CACHE_PREFIX}::${type}`, key).catch(() => this.checkConnection());
    }

    public async deleteAll(type: string): Promise<void> {
        LoggingService.getInstance().debug(
            `Redis Cache: delete cacheKeyPrefix ${type}`
        );
        await this.delAsync(`${this.KIX_CACHE_PREFIX}::${type}`).catch(() => this.checkConnection());
    }

    public async waitFor(key: string, cacheType: string): Promise<any> {
        let cachedObject: any;
        let retryCount = 0;
        while (!cachedObject && retryCount < 30) {
            retryCount++;
            const promise = new Promise<boolean>((resolve, reject) => {
                setTimeout(async () => {
                    const result = await this.get(cacheType, key);
                    resolve(result);
                }, 50);
            });
            cachedObject = await promise;
        }

        return cachedObject;
    }

    private checkConnection(): void {
        if (!this.redisClient || !this.redisClient?.connected) {
            LoggingService.getInstance().info('REDIS quit');
            this.redisClient?.quit();
            this.connect();
        }
    }

    private connect(): void {
        this.redisClient = null;

        const config = ConfigurationService.getInstance().getServerConfiguration();
        const port = config.REDIS_CACHE_PORT;
        const host = config.REDIS_CACHE_HOST;

        const redis = require('redis');

        try {
            this.redisClient = redis.createClient({
                port, host, retry_strategy: (options) => 2000
            });

            this.redisClient.on('error', (error) => {
                LoggingService.getInstance().error(error);
            });

            this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
            this.scanAsync = promisify(this.redisClient.scan).bind(this.redisClient);
            this.hgetAsync = promisify(this.redisClient.hget).bind(this.redisClient);
            this.hsetAsync = promisify(this.redisClient.hset).bind(this.redisClient);
            this.hdelAsync = promisify(this.redisClient.hdel).bind(this.redisClient);
            this.hvalsAsync = promisify(this.redisClient.hvals).bind(this.redisClient);
        } catch (error) {
            LoggingService.getInstance().error(error);
        }

    }

    private async scan(pattern: string): Promise<string[]> {
        const found = [];
        let cursor = '0';

        do {
            const reply = await this.scanAsync(cursor, 'MATCH', pattern);

            cursor = reply[0];
            found.push(...reply[1]);
        } while (cursor !== '0');

        return found;
    }

    public subscribe(channel: string, cb: (events: BackendNotification[]) => void): void {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const port = config.REDIS_CACHE_PORT;
        const host = config.REDIS_CACHE_HOST;

        const redis = require('redis');
        const subscriber = redis.createClient({
            port, host, retry_strategy: (options) => 2000
        });

        subscriber?.subscribe(channel, (error, message) => {
            if (error) {
                LoggingService.getInstance().error(error);
            }
            LoggingService.getInstance().info(`REDIS: Subscribed to channel ${message}`);
        });

        subscriber?.on('message', (incomingChannel: string, message) => {
            if (incomingChannel === channel) {
                try {
                    const events = JSON.parse(message);
                    if (Array.isArray(events)) {
                        cb(events);
                    }
                } catch (err) {
                    LoggingService.getInstance().error(err);
                }
            }
        });
    }

}
