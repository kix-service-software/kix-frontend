/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RedisCache } from './RedisCache';

import md5 from 'md5';
import { ObjectUpdatedEventData } from '../../../model/ObjectUpdatedEventData';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { RequestMethod } from '../../../../../server/model/rest/RequestMethod';

export class CacheService {

    private static INSTANCE: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.INSTANCE) {
            CacheService.INSTANCE = new CacheService();
        }
        return CacheService.INSTANCE;
    }

    private ignorePrefixes: string[] = [];
    private dependencies: Map<string, string[]> = new Map();

    private constructor() {
        this.init();
    }

    public addDependencies(key: string, dependencies: string[]): void {
        if (!this.dependencies.has(key)) {
            this.dependencies.set(key, dependencies);
        } else {
            this.dependencies.set(key, [...this.dependencies.get(key), ...dependencies]);
        }
    }

    public init(): void {
        RedisCache.getInstance();
    }

    public async getAll(cacheKeyPrefix: string): Promise<any[]> {
        return await RedisCache.getInstance().getAll(cacheKeyPrefix);
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        key = md5(key);
        return await RedisCache.getInstance().get(key, cacheKeyPrefix);
    }

    public async set(key: string, value: any, cacheKeyPrefix?: string): Promise<void> {
        key = md5(key);
        await RedisCache.getInstance().set(key, cacheKeyPrefix, value);
    }

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            if (!event.Namespace) {
                LoggingService.getInstance().warning('Ignore Backend Notification (missing Namespace in event)', event);
            } else if (!event.Namespace.startsWith(KIXObjectType.TRANSLATION_PATTERN)) {
                LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
                await this.deleteKeys(event.Namespace);
            }
        }
    }

    public async deleteKeys(cacheKeyPrefix: string, force: boolean = false): Promise<void> {
        let prefixes = await this.getCacheKeyPrefixes(cacheKeyPrefix);
        if (!force) {
            prefixes = prefixes.filter((p) => !this.ignorePrefixes.some((ip) => ip === p));
        }

        for (const prefix of prefixes) {
            await RedisCache.getInstance().deleteKeys(prefix);
        }
    }

    private async getCacheKeyPrefixes(objectNamespace: string): Promise<string[]> {
        let cacheKeyPrefixes: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                cacheKeyPrefixes.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_VOTE);
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

        if (this.dependencies.has(cacheKeyPrefixes[0])) {
            cacheKeyPrefixes = [
                ...cacheKeyPrefixes,
                ...this.dependencies.get(cacheKeyPrefixes[0])
            ];
        }

        switch (cacheKeyPrefixes[0]) {
            case KIXObjectType.WATCHER:
            case KIXObjectType.ARTICLE:
            case KIXObjectType.DYNAMIC_FIELD:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.TICKET:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                cacheKeyPrefixes.push(KIXObjectType.ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.QUEUE);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                // needed for permission checks of objectactions (HttpService) - check new after ticket update
                cacheKeyPrefixes.push(RequestMethod.OPTIONS);
                break;
            case KIXObjectType.FAQ_VOTE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
                break;
            case KIXObjectType.FAQ_CATEGORY:
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                break;
            case KIXObjectType.CONFIG_ITEM:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM_CLASS);
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.PERSONAL_SETTINGS:
            case KIXObjectType.USER_PREFERENCE:
                cacheKeyPrefixes.push(KIXObjectType.USER);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                break;
            case KIXObjectType.USER:
                cacheKeyPrefixes.push(KIXObjectType.ROLE);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.REPORT_DEFINITION);
                break;
            case KIXObjectType.LINK:
            case KIXObjectType.LINK_OBJECT:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.LINK);
                cacheKeyPrefixes.push(KIXObjectType.LINK_OBJECT);
                cacheKeyPrefixes.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.ORGANISATION:
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.CONTACT:
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.USER);
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.PERMISSION:
            case KIXObjectType.ROLE:
            case 'Migration':
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
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION);
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION:
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION);
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                cacheKeyPrefixes.push(KIXObjectType.REPORT_DEFINITION);
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
            case KIXObjectType.JOB:
                cacheKeyPrefixes.push(KIXObjectType.JOB_RUN);
                cacheKeyPrefixes.push(KIXObjectType.JOB_RUN_LOG);
                break;
            case KIXObjectType.REPORT_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.REPORT_DEFINITION);
                cacheKeyPrefixes.push(KIXObjectType.REPORT);
                cacheKeyPrefixes.push(KIXObjectType.REPORT_RESULT);
                cacheKeyPrefixes.push(KIXObjectType.ROLE);
                cacheKeyPrefixes.push(KIXObjectType.ROLE_PERMISSION);
                break;
            case KIXObjectType.REPORT:
            case KIXObjectType.REPORT_RESULT:
                cacheKeyPrefixes.push(KIXObjectType.REPORT_DEFINITION);
                cacheKeyPrefixes.push(KIXObjectType.REPORT);
                cacheKeyPrefixes.push(KIXObjectType.REPORT_RESULT);
                break;
            default:
        }

        return cacheKeyPrefixes;
    }

    private async clearCache(): Promise<void> {
        await RedisCache.getInstance().clear(this.ignorePrefixes);
    }

    public adddIgnorePrefixes(ignoreList: string[]): void {
        this.ignorePrefixes = [...this.ignorePrefixes, ...ignoreList];
    }

}
