/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ICache } from "./ICache";
import { LoggingService } from "../../../../../server/services/LoggingService";

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

    public async clear(ignoreKeyPrefixes: string[] = []): Promise<void> {
        const iterator = this.keyIndex.keys();

        let prefix = iterator.next();
        while (prefix && prefix.value) {
            if (!ignoreKeyPrefixes.some((p) => p === prefix.value)) {
                await this.deleteKeys(prefix.value);
            }
            prefix = iterator.next();
        }

        const newIndex: Map<string, string[]> = new Map();
        for (const ignorePrefix of ignoreKeyPrefixes) {
            if (this.keyIndex.has(ignorePrefix)) {
                newIndex.set(ignorePrefix, this.keyIndex.get(ignorePrefix));
            }
        }

        this.keyIndex = newIndex;
    }

    public async has(key: string): Promise<boolean> {
        return this.cache.has(key);
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
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
            if (this.keyIndex.has(cacheKeyPrefix)) {
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
            const keys = [...this.keyIndex.get(cacheKeyPrefix)];
            LoggingService.getInstance().debug(
                `InMemoryCache: delete cacheKeyPrefix ${cacheKeyPrefix} - key count: ${keys.length}`
            );
            for (const key of keys) {
                await this.delete(key, cacheKeyPrefix);
            }
        }
    }

}
