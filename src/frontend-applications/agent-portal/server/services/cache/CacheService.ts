/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RedisCache } from './RedisCache';
import { FileCache } from './FileCache';

import md5 from 'md5';
import { BackendNotification } from '../../../model/BackendNotification';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { RequestMethod } from '../../../../../server/model/rest/RequestMethod';
import { ProfilingService } from '../../../../../server/services/ProfilingService';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { ICache } from './ICache';

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
    private backendType: string;

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
        this.backendType = ConfigurationService.getInstance().getServerConfiguration().CACHE_BACKEND || 'Redis';

        LoggingService.getInstance().info(`Initialize ${this.backendType} cache backend`);

        const cacheInstance = this.getCacheBackendInstance();
        if (!cacheInstance) {
            LoggingService.getInstance().error(`Unknown cache backend "${this.backendType}" - No Cache in use`);
        }
    }

    public hasCacheBackend(): boolean {
        return this.getCacheBackendInstance() !== null;
    }

    public async getAll(type: string): Promise<any[]> {
        return await this.getCacheBackendInstance()?.getAll(type);
    }

    public async get(key: string, type: string = ''): Promise<any> {
        key = md5(key);
        return await this.getCacheBackendInstance()?.get(type, key);
    }

    public async set(key: string, value: any, type: string = ''): Promise<void> {
        key = md5(key);
        await this.getCacheBackendInstance()?.set(type, key, value);
    }

    public async updateCaches(events: BackendNotification[]): Promise<void> {
        for (const event of events) {
            if (event.Event === 'CLEAR_CACHE') {
                LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
                await this.clearCache();
            } else if (!event.Namespace) {
                LoggingService.getInstance().warning('Ignore Backend Notification (missing Namespace in event)', event);
            } else if (!event.Namespace.startsWith(KIXObjectType.TRANSLATION_PATTERN)) {
                LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
                await this.deleteKeys(event.Namespace);
            }
        }
    }

    public async deleteKeys(type: string, force: boolean = false): Promise<void> {
        if (!type || type.length === 0)
            return;

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'CacheService',
            'deleteKeys',
            {
                data: [type]
            }
        );

        let prefixes = await this.getCacheKeyPrefixes(type);
        if (!force) {
            prefixes = prefixes.filter((p) => !this.ignorePrefixes.some((ip) => ip === p));
        }

        for (const prefix of prefixes) {
            await this.getCacheBackendInstance()?.deleteAll(prefix);
        }
        ProfilingService.getInstance().stop(profileTaskId);
    }

    private async getCacheKeyPrefixes(objectNamespace: string): Promise<string[]> {
        let types: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                types.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                types.push(KIXObjectType.FAQ_CATEGORY);
                types.push(KIXObjectType.FAQ_ARTICLE);
                types.push(KIXObjectType.FAQ_VOTE);
            } else {
                types.push(namespace[0]);
            }
        } else if (objectNamespace === 'State') {
            types.push(KIXObjectType.TICKET_STATE);
        } else if (objectNamespace === 'Type') {
            types.push(KIXObjectType.TICKET_TYPE);
        } else {
            types.push(objectNamespace);
        }

        if (this.dependencies.has(types[0])) {
            types = [
                ...types,
                ...this.dependencies.get(types[0])
            ];
        }

        switch (types[0]) {
            case KIXObjectType.WATCHER:
            case KIXObjectType.ARTICLE:
            case KIXObjectType.DYNAMIC_FIELD:
                types.push(KIXObjectType.TICKET);
                types.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.TICKET:
                types.push(KIXObjectType.CONFIG_ITEM);
                types.push(KIXObjectType.ARTICLE);
                types.push(KIXObjectType.ORGANISATION);
                types.push(KIXObjectType.CONTACT);
                types.push(KIXObjectType.QUEUE);
                types.push(KIXObjectType.CURRENT_USER);
                types.push(KIXObjectType.TICKET_HISTORY);
                // needed for permission checks of objectactions (HttpService) - check new after ticket update
                types.push(RequestMethod.OPTIONS);
                break;
            case KIXObjectType.FAQ_VOTE:
                types.push(KIXObjectType.FAQ_ARTICLE);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                types.push(KIXObjectType.FAQ_CATEGORY);
                break;
            case KIXObjectType.FAQ_CATEGORY:
                types.push(KIXObjectType.OBJECT_ICON);
                break;
            case KIXObjectType.CONFIG_ITEM:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                types.push(KIXObjectType.CONFIG_ITEM_CLASS);
                types.push(KIXObjectType.ORGANISATION);
                types.push(KIXObjectType.CONTACT);
                types.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.PERSONAL_SETTINGS:
            case KIXObjectType.USER_PREFERENCE:
                types.push(KIXObjectType.USER);
                types.push(KIXObjectType.CURRENT_USER);
                types.push(KIXObjectType.CONTACT);
                break;
            case KIXObjectType.USER:
                types.push(KIXObjectType.ROLE);
                types.push(KIXObjectType.CONTACT);
                types.push(KIXObjectType.REPORT_DEFINITION);
                break;
            case KIXObjectType.LINK:
            case KIXObjectType.LINK_OBJECT:
                types.push(KIXObjectType.TICKET);
                types.push(KIXObjectType.CONFIG_ITEM);
                types.push(KIXObjectType.FAQ_ARTICLE);
                types.push(KIXObjectType.LINK);
                types.push(KIXObjectType.LINK_OBJECT);
                types.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.ORGANISATION:
                types.push(KIXObjectType.CONTACT);
                types.push(KIXObjectType.TICKET);
                types.push(KIXObjectType.OBJECT_ICON);
                types.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.CONTACT:
                types.push(KIXObjectType.ORGANISATION);
                types.push(KIXObjectType.TICKET);
                types.push(KIXObjectType.USER);
                types.push(KIXObjectType.OBJECT_ICON);
                types.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.PERMISSION:
            case KIXObjectType.ROLE:
            case 'Migration':
                await this.clearCache();
                break;
            case KIXObjectType.TRANSLATION_PATTERN:
            case KIXObjectType.TRANSLATION:
            case KIXObjectType.TRANSLATION_LANGUAGE:
                types.push(KIXObjectType.TRANSLATION_PATTERN);
                types.push(KIXObjectType.TRANSLATION);
                types.push(KIXObjectType.TRANSLATION_LANGUAGE);
                break;
            case KIXObjectType.CONFIG_ITEM_VERSION:
                types.push(KIXObjectType.CONFIG_ITEM);
                types.push(KIXObjectType.ORGANISATION);
                types.push(KIXObjectType.CONTACT);
                types.push(KIXObjectType.GRAPH);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION_DEFINITION:
                types.push(KIXObjectType.SYS_CONFIG_OPTION);
                types.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION:
                types.push(KIXObjectType.SYS_CONFIG_OPTION);
                types.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                types.push(KIXObjectType.REPORT_DEFINITION);
                break;
            case KIXObjectType.QUEUE:
            case KIXObjectType.TICKET_STATE:
            case KIXObjectType.TICKET_TYPE:
            case KIXObjectType.TICKET_PRIORITY:
                types.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.GENERAL_CATALOG_ITEM:
                types.push(KIXObjectType.GENERAL_CATALOG_CLASS);
                break;
            case KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN:
                types.push(KIXObjectType.IMPORT_EXPORT_TEMPLATE);
                break;
            case KIXObjectType.JOB:
                types.push(KIXObjectType.JOB_RUN);
                types.push(KIXObjectType.JOB_RUN_LOG);
                break;
            case KIXObjectType.REPORT_DEFINITION:
                types.push(KIXObjectType.REPORT_DEFINITION);
                types.push(KIXObjectType.REPORT);
                types.push(KIXObjectType.REPORT_RESULT);
                types.push(KIXObjectType.ROLE);
                types.push(KIXObjectType.ROLE_PERMISSION);
                break;
            case KIXObjectType.REPORT:
            case KIXObjectType.REPORT_RESULT:
                types.push(KIXObjectType.REPORT_DEFINITION);
                types.push(KIXObjectType.REPORT);
                types.push(KIXObjectType.REPORT_RESULT);
                break;
            default:
        }

        return types;
    }

    public async clearCache(): Promise<void> {
        const taskId = ProfilingService.getInstance().start('CacheService', 'Clear Cache');
        await this.getCacheBackendInstance()?.clear(this.ignorePrefixes);
        ProfilingService.getInstance().stop(taskId);
    }

    public adddIgnorePrefixes(ignoreList: string[]): void {
        this.ignorePrefixes = [...this.ignorePrefixes, ...ignoreList];
    }

    private getCacheBackendInstance(): ICache {
        if (this.backendType === 'Redis')
            return RedisCache.getInstance();
        if (this.backendType === 'File')
            return FileCache.getInstance();
        return null;
    }

}
