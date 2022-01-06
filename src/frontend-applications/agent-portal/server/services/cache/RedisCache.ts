/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
    private scanAsync: (cursor: any, match: string, pattern: string) => Promise<string[]>;

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
        for (const key of keys) {
            await this.delete(key);
        }
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        let value = await this.getAsync(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::${key}`)
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

    public async getAll(cacheKeyPrefix: string): Promise<any[]> {
        const keys = await this.scan(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::*`)
            .catch((error) => {
                LoggingService.getInstance().error(error);
                this.checkConnection();
                return null;
            });

        const values: any[] = [];

        for (const key of keys) {
            let value = await this.getAsync(key)
                .catch((error) => {
                    LoggingService.getInstance().error(error);
                    this.checkConnection();
                    return null;
                });

            try {
                value = JSON.parse(value);
                // tslint:disable-next-line:no-empty
            } catch (error) {
                // do nothing
            }

            values.push(value);
        }

        return values;
    }

    public async set(key: string, cacheKeyPrefix: string, value: any): Promise<void> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        await this.setAsync(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::${key}`, value)
            .catch(() => this.checkConnection());
    }

    public async delete(key: string, cacheKeyPrefix?: string): Promise<void> {
        await this.delAsync(key).catch(() => this.checkConnection());
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const keys = await this.scan(`${this.KIX_CACHE_PREFIX}::${cacheKeyPrefix}::*`)
            .catch(() => {
                this.checkConnection();
                return null;
            });
        if (keys) {
            LoggingService.getInstance().debug(
                `Redis Cache: delete cacheKeyPrefix ${cacheKeyPrefix} - key count: ${keys.length}`
            );
            keys.forEach((k) => this.delAsync(k).catch(() => this.checkConnection()));
        }
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

            this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
            this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
            this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
            this.scanAsync = promisify(this.redisClient.scan).bind(this.redisClient);
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

}
