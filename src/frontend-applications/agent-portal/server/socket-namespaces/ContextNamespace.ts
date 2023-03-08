/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { ContextEvent } from '../../modules/base-components/webapp/core/ContextEvent';
import { LoadContextConfigurationRequest } from '../../modules/base-components/webapp/core/LoadContextConfigurationRequest';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { LoadContextConfigurationResponse } from '../../modules/base-components/webapp/core/LoadContextConfigurationResponse';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { SocketEvent } from '../../modules/base-components/webapp/core/SocketEvent';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ContextConfigurationResolver } from '../services/configuration/ContextConfigurationResolver';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { SysConfigOptionProperty } from '../../modules/sysconfig/model/SysConfigOptionProperty';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SearchOperator } from '../../modules/search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { CacheService } from '../services/cache';
import { ISocketResponse } from '../../modules/base-components/webapp/core/ISocketResponse';
import { ISocketRequest } from '../../modules/base-components/webapp/core/ISocketRequest';
import { LoggingService } from '../../../../server/services/LoggingService';
import { Socket } from 'socket.io';
import { UserService } from '../../modules/user/server/UserService';
import cookie from 'cookie';
import { User } from '../../modules/user/model/User';
import { ContextPreference } from '../../model/ContextPreference';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { PluginService } from '../../../../server/services/PluginService';
import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';

export class ContextNamespace extends SocketNameSpace {

    private static INSTANCE: ContextNamespace;

    public static getInstance(): ContextNamespace {
        if (!ContextNamespace.INSTANCE) {
            ContextNamespace.INSTANCE = new ContextNamespace();
        }
        return ContextNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    private rebuildPromise: Promise<void>;
    private configCache: Map<string, Map<string, IConfiguration>> = new Map();

    protected getNamespace(): string {
        return 'context';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(
            client, ContextEvent.LOAD_CONTEXT_CONFIGURATION, this.loadContextConfiguration.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.LOAD_CONTEXT_CONFIGURATIONS, this.loadContextConfigurations.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.REBUILD_CONFIG, this.rebuildConfiguration.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.LOAD_STORED_CONTEXTS, this.loadStoreContexts.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.STORE_CONTEXT, this.storeContext.bind(this)
        );
        this.registerEventHandler(
            client, ContextEvent.REMOVE_STORED_CONTEXT, this.removeStoredContext.bind(this)
        );
    }

    protected initialize(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['ContextConfiguration']);
        return this.rebuildConfigCache();
    }

    private async rebuildConfiguration(
        data: ISocketRequest
    ): Promise<SocketResponse<ISocketResponse | SocketErrorResponse>> {
        await this.rebuildConfigCache().catch((error) => {
            LoggingService.getInstance().error('Error on rebuild context configurations', error);
        });

        const response: ISocketResponse = { requestId: data.requestId };
        return new SocketResponse(ContextEvent.REBUILD_CONFIG_FINISHED, response);
    }

    public async rebuildConfigCache(): Promise<void> {
        if (!this.rebuildPromise) {
            // eslint-disable-next-line no-async-promise-executor
            this.rebuildPromise = new Promise<void>(async (resolve, reject) => {
                const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
                    AgentPortalExtensions.MARKO_APPLICATION
                );

                for (const application of applications) {
                    await this.rebuildApplicationConfigurations(application);
                }

                this.rebuildPromise = null;
                resolve();
            });
        }

        return this.rebuildPromise;
    }

    private async rebuildApplicationConfigurations(application: IMarkoApplication): Promise<void> {
        const hasCacheBackend = CacheService.getInstance().hasCacheBackend();
        if (hasCacheBackend) {
            await CacheService.getInstance().deleteKeys(`${application.name}ContextConfiguration`, true);
        } else {
            this.configCache.clear();
        }

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.OR, application.name
            )
        ], null, 0);

        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            serverConfig.BACKEND_API_TOKEN, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
            loadingOptions, null
        ).catch((): SysConfigOption[] => []);

        const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

        LoggingService.getInstance().info(`${application.name}: Build ${contextOptions.length} context configurations.`);

        if (!hasCacheBackend && !this.configCache.has(application.name)) {
            this.configCache.set(application.name, new Map());
        }

        for (const contextOption of contextOptions) {

            if (contextOption.Value) {
                const newConfig = await ContextConfigurationResolver.getInstance().resolve(
                    serverConfig.BACKEND_API_TOKEN,
                    JSON.parse(contextOption.Value) as ContextConfiguration,
                    options
                );

                if (hasCacheBackend) {
                    await CacheService.getInstance().set(
                        newConfig.contextId, newConfig, `${application.name}ContextConfiguration`
                    );
                } else {
                    this.configCache.get(application.name).set(newConfig.contextId, newConfig);
                }
            }
        }
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest, client: Socket
    ): Promise<SocketResponse<LoadContextConfigurationResponse<any> | SocketErrorResponse>> {
        const cacheType = `${data.application}ContextConfiguration`;

        let configuration = CacheService.getInstance().hasCacheBackend()
            ? await CacheService.getInstance().get(data.contextId, cacheType)
            : this.configCache.get(data.contextId);

        if (!configuration) {
            await this.rebuildConfigCache();
            configuration = CacheService.getInstance().hasCacheBackend()
                ? await CacheService.getInstance().get(data.contextId, cacheType)
                : this.configCache.get(data.contextId);
        }

        if (!configuration) {
            return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(
                data.requestId, `No configuration extension for context ${data.contextId} available.`
            ));
        }

        const response = new LoadContextConfigurationResponse(data.requestId, configuration as ContextConfiguration);
        return new SocketResponse(ContextEvent.CONTEXT_CONFIGURATION_LOADED, response);
    }

    protected async loadContextConfigurations(
        data: any
    ): Promise<SocketResponse<ISocketResponse | SocketErrorResponse>> {
        const configurations = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, data.application
            )
        ]);

        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            serverConfig.BACKEND_API_TOKEN, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
            loadingOptions, null
        );

        const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

        const cacheType = `${data.application}ContextConfiguration`;
        for (const contextOption of contextOptions) {
            const configuration = await CacheService.getInstance().get(contextOption.Name, cacheType);

            if (configuration) {
                configurations.push(configuration);
            }
        }

        const response = {
            requestId: data.requestId,
            configurations
        };
        return new SocketResponse(ContextEvent.CONTEXT_CONFIGURATIONS_LOADED, response);
    }

    protected async loadStoreContexts(data: any, client: Socket): Promise<SocketResponse<any | SocketErrorResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;

        const tokenPrefix = client?.handshake?.headers?.tokenprefix || '';
        const token = parsedCookie ? parsedCookie[`${tokenPrefix}token`] : '';

        let contextList: ContextPreference[] = [];
        const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
        if (user) {
            const fileName = this.getContextListFileName(user);
            contextList = ConfigurationService.getInstance().getDataFileContent(fileName, []);
        }

        const response = {
            requestId: data.requestId,
            contextPreferences: contextList
        };
        return new SocketResponse(ContextEvent.LOAD_STORED_CONTEXTS_FINISCHED, response);
    }

    protected async storeContext(data: any, client: Socket): Promise<SocketResponse<any | SocketErrorResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
        if (user) {
            const fileName = this.getContextListFileName(user);
            const contextList: ContextPreference[] = ConfigurationService.getInstance().getDataFileContent(
                fileName, []
            );

            const index = contextList
                .filter((c) => c !== null && typeof c !== 'undefined')
                .findIndex((cp) => cp?.instanceId === data?.contextPreference?.instanceId);
            if (index !== -1) {
                contextList.splice(index, 1);
            }

            if (data.contextPreference) {
                contextList.push(data.contextPreference);
            }
            ConfigurationService.getInstance().saveDataFileContent(fileName, contextList);
        }

        const response = { requestId: data.requestId };
        return new SocketResponse(ContextEvent.STORE_CONTEXT_FINISCHED, response);
    }

    protected async removeStoredContext(data: any, client: Socket): Promise<SocketResponse<any | SocketErrorResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);
        if (user) {
            const fileName = this.getContextListFileName(user);
            const contextList: ContextPreference[] = ConfigurationService.getInstance().getDataFileContent(
                fileName, []
            );

            const index = contextList
                .filter((c) => c !== null && typeof c !== 'undefined')
                .findIndex((cp) => cp?.instanceId === data?.instanceId);
            if (index !== -1) {
                contextList.splice(index, 1);
            }
            ConfigurationService.getInstance().saveDataFileContent(fileName, contextList);
        }

        const response = { requestId: data.requestId };
        return new SocketResponse(ContextEvent.REMOVE_STORED_CONTEXT_FINISHED, response);
    }

    private getContextListFileName(user: User): string {
        return `${user.UserID}_ContextList.json`;
    }

}
