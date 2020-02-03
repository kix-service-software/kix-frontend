/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { InMemoryCache } from "./InMemoryCache";
import { RedisCache } from "./RedisCache";

import md5 = require('md5');
import { ConfigurationService } from "../../../../../server/services/ConfigurationService";
import { ObjectUpdatedEventData } from "../../../model/ObjectUpdatedEventData";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { LoggingService } from "../../../../../server/services/LoggingService";

export class CacheService {

    private static INSTANCE: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.INSTANCE) {
            CacheService.INSTANCE = new CacheService();
        }
        return CacheService.INSTANCE;
    }

    private useRedisCache: boolean = false;
    private useInMemoryCache: boolean = false;

    private constructor() {
        this.init();
    }

    public init(): void {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.USE_REDIS_CACHE) {
            this.useRedisCache = true;
            RedisCache.getInstance();
        }

        if (serverConfig.USE_IN_MEMORY_CACHE) {
            this.useInMemoryCache = true;
        }
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        key = md5(key);
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        } else if (this.useRedisCache) {
            return await RedisCache.getInstance().get(key, cacheKeyPrefix);
        } else if (this.useInMemoryCache) {
            return await InMemoryCache.getInstance().get(key, cacheKeyPrefix);
        }
        return null;
    }

    public async set(key: string, value: any, cacheKeyPrefix?: string): Promise<void> {
        key = md5(key);
        if (this.useRedisCache) {
            await RedisCache.getInstance().set(key, cacheKeyPrefix, value);
        } else if (this.useInMemoryCache) {
            await InMemoryCache.getInstance().set(key, cacheKeyPrefix, value);
        }
    }

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            if (!event.Namespace.startsWith(KIXObjectType.TRANSLATION_PATTERN)) {
                LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
                await this.deleteKeys(event.Namespace);
            }
        }
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const prefixes = await this.getCacheKeyPrefixes(cacheKeyPrefix);
        for (const prefix of prefixes) {
            if (this.useRedisCache) {
                await RedisCache.getInstance().deleteKeys(prefix);
            } else if (this.useInMemoryCache) {
                await InMemoryCache.getInstance().deleteKeys(prefix);
            }
        }
    }

    private async getCacheKeyPrefixes(objectNamespace: string): Promise<string[]> {
        let cacheKeyPrefixes: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                cacheKeyPrefixes.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
            } else {
                cacheKeyPrefixes.push(namespace[0]);
            }
        } else if (objectNamespace === 'State') {
            cacheKeyPrefixes.push(KIXObjectType.TICKET_STATE);
        } else if (objectNamespace === 'Type') {
            cacheKeyPrefixes.push(KIXObjectType.TICKET_TYPE);
        } else {
            cacheKeyPrefixes.push(objectNamespace);
        }

        switch (cacheKeyPrefixes[0]) {
            case KIXObjectType.WATCHER:
            case KIXObjectType.ARTICLE:
            case KIXObjectType.DYNAMIC_FIELD:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.TICKET:
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.QUEUE);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.FAQ_VOTE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
                break;
            case KIXObjectType.CONFIG_ITEM:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM_CLASS);
                break;
            case KIXObjectType.PERSONAL_SETTINGS:
            case KIXObjectType.USER_PREFERENCE:
                cacheKeyPrefixes.push(KIXObjectType.USER);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.USER:
                cacheKeyPrefixes.push(KIXObjectType.ROLE);
                break;
            case KIXObjectType.LINK:
            case KIXObjectType.LINK_OBJECT:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.LINK);
                cacheKeyPrefixes.push(KIXObjectType.LINK_OBJECT);
                break;
            case KIXObjectType.ORGANISATION:
            case KIXObjectType.CONTACT:
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.PERMISSION:
            case KIXObjectType.ROLE:
                await this.clearCache();
                cacheKeyPrefixes = [];
                break;
            case KIXObjectType.TRANSLATION_PATTERN:
            case KIXObjectType.TRANSLATION:
            case KIXObjectType.TRANSLATION_LANGUAGE:
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION_PATTERN);
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION);
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION_LANGUAGE);
                break;
            case KIXObjectType.CONFIG_ITEM_VERSION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION_DEFINITION:
            case KIXObjectType.SYS_CONFIG_OPTION:
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION);
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                break;
            case KIXObjectType.QUEUE:
            case KIXObjectType.TICKET_STATE:
            case KIXObjectType.TICKET_TYPE:
            case KIXObjectType.TICKET_PRIORITY:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.GENERAL_CATALOG_ITEM:
                cacheKeyPrefixes.push(KIXObjectType.GENERAL_CATALOG_CLASS);
                break;
            case KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN:
                cacheKeyPrefixes.push(KIXObjectType.IMPORT_EXPORT_TEMPLATE);
                break;
            default:
        }

        return cacheKeyPrefixes;
    }

    private async clearCache(): Promise<void> {
        if (this.useRedisCache) {
            await RedisCache.getInstance().clear();
        } else if (this.useInMemoryCache) {
            await InMemoryCache.getInstance().clear();
        }
    }

}
