/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

import * as cookie from 'cookie';
import { Socket } from 'socket.io';

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
                await CacheService.getInstance().deleteKeys('ContextConfiguration', true);

                const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, 'kix18-web-frontend'
                    )
                ]);

                const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                    serverConfig.BACKEND_API_TOKEN, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
                    loadingOptions, null
                ).catch((): SysConfigOption[] => []);

                const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

                LoggingService.getInstance().info(`Build ${contextOptions.length} context configurations.`);

                for (const contextOption of contextOptions) {

                    if (contextOption.Value) {
                        const newConfig = await ContextConfigurationResolver.getInstance().resolve(
                            serverConfig.BACKEND_API_TOKEN,
                            JSON.parse(contextOption.Value) as ContextConfiguration,
                            options
                        );

                        await CacheService.getInstance().set(newConfig.contextId, newConfig, 'ContextConfiguration');
                    }
                }

                this.rebuildPromise = null;
                resolve();
            });
        }

        return this.rebuildPromise;
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest, client: Socket)
        : Promise<SocketResponse<LoadContextConfigurationResponse<any> | SocketErrorResponse>> {
        const parsedCookie = client ? cookie.parse(client.handshake.headers.cookie) : null;
        const token = parsedCookie ? parsedCookie.token : '';

        let configuration = await CacheService.getInstance().get(data.contextId, 'ContextConfiguration');

        if (!configuration) {
            await this.rebuildConfigCache();
            configuration = await CacheService.getInstance().get(data.contextId, 'ContextConfiguration');
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
        data: ISocketRequest
    ): Promise<SocketResponse<ISocketResponse | SocketErrorResponse>> {
        const configurations = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'kix18-web-frontend'
            )
        ]);

        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            serverConfig.BACKEND_API_TOKEN, 'ContextConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
            loadingOptions, null
        ).catch((): SysConfigOption[] => []);

        const contextOptions = options.filter((c) => c.ContextMetadata === 'Context');

        for (const contextOption of contextOptions) {
            const configuration = await CacheService.getInstance().get(contextOption.Name, 'ContextConfiguration');

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

}
