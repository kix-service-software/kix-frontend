/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../server/model/Error';
import { LogLevel } from '../../../../../server/model/LogLevel';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { AgentPortalConfiguration } from '../../../model/configuration/AgentPortalConfiguration';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { ModuleConfigurationService } from '../../../server/services/configuration/ModuleConfigurationService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { SysConfigKey } from '../model/SysConfigKey';
import { SysConfigOption } from '../model/SysConfigOption';
import { SysConfigOptionDefinition } from '../model/SysConfigOptionDefinition';

export class SysConfigService extends KIXObjectAPIService {

    private static INSTANCE: SysConfigService;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }
        return SysConfigService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'config');

    public objectType: KIXObjectType | string = KIXObjectType.SYS_CONFIG_OPTION;

    private preloadOptionKeys: string[] = [
        SysConfigKey.FRONTEND_RICHTEXT_DEFAULT_CSS,
        SysConfigKey.TICKET_FRONTEND_PENDING_DIFF_TIME,
        SysConfigKey.TICKET_FRONTEND_NEED_ACCOUNTED_TIME,
        SysConfigKey.DEFAULT_USED_LANGUAGES,
        SysConfigKey.DEFAULT_LANGUAGE,
        SysConfigKey.IMPRINT_LINK,
        SysConfigKey.USER_MANUAL,
        SysConfigKey.ADMIN_MANUAL,
        SysConfigKey.KIX_PRODUCT,
        SysConfigKey.KIX_VERSION,
        SysConfigKey.MAX_ALLOWED_SIZE
    ];

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public async preloadOptions(): Promise<void> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        LoggingService.getInstance().info('Preload SysconfigOptions');
        if (config.LOG_LEVEL === LogLevel.DEBUG) {
            for (const o of this.preloadOptionKeys) {
                LoggingService.getInstance().debug(o);
            }
        }

        LoggingService.getInstance().info('Preload SysconfigOptions');

        for (const key of this.preloadOptionKeys) {
            await this.loadObjects<SysConfigOption>(
                config?.BACKEND_API_TOKEN, 'SysConfigServicePreload', KIXObjectType.SYS_CONFIG_OPTION, [key], null, null
            ).catch((): SysConfigOption[] => []);
        }
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            objects = await super.load<SysConfigOption>(
                token, KIXObjectType.SYS_CONFIG_OPTION, this.RESOURCE_URI, loadingOptions, objectIds,
                KIXObjectType.SYS_CONFIG_OPTION, clientRequestId, SysConfigOption
            );
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            objects = await super.load<SysConfigOptionDefinition>(
                token, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, uri,
                loadingOptions, objectIds, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
                clientRequestId, SysConfigOptionDefinition
            );
        }

        return objects;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: string
    ): Promise<string> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            const uri = this.buildUri(this.RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, this.objectType, 'Name'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions', objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, 'Option'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        }
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
                'Option', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else {
            return super.createObject(token, clientRequestId, objectType, parameter, createOptions, cacheKeyPrefix);
        }
    }

    public async deleteObjects(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<string | number>,
        deleteOptions?: KIXObjectSpecificDeleteOptions, logError: boolean = true
    ): Promise<void> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uris = objectIds.map((id) => this.buildUri(this.RESOURCE_URI, 'definitions', id));
            const errors: Error[] = await this.sendDeleteRequest(token, clientRequestId, uris, objectType, logError)
                .catch((error) => { throw new Error(error.Code, error.Message); });
            errors.forEach((e) => LoggingService.getInstance().error(`${e.Code}: ${e.Message}`, e));
        }
    }

    public async getTicketViewableStateTypes(token: string): Promise<string[]> {
        const viewableStateTypes = await this.loadObjects<SysConfigOption>(
            token, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_VIEWABLE_STATE_TYPE], null, null
        ).catch(() => [] as SysConfigOption[]);

        const stateTypes: string[] = viewableStateTypes && viewableStateTypes.length ? viewableStateTypes[0].Value : [];

        return stateTypes && !!stateTypes.length ? stateTypes : ['new', 'open', 'pending reminder', 'pending auto'];
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return [];
    }

    public async getAgentPortalConfiguration(token: string): Promise<AgentPortalConfiguration> {
        const configs = await this.loadObjects<SysConfigOption>(
            token, '', KIXObjectType.SYS_CONFIG_OPTION, [AgentPortalConfiguration.CONFIGURATION_ID], null, null
        ).catch((): SysConfigOption[] => []);

        let config: AgentPortalConfiguration;
        if (Array.isArray(configs) && configs.length) {
            try {
                config = JSON.parse(configs[0].Value);
            } catch (error) {
                LoggingService.getInstance().error(error);
            }
        }

        return config;
    }

}
