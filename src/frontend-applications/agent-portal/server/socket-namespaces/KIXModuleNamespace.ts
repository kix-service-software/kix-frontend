/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { KIXModulesEvent } from '../../modules/base-components/webapp/core/KIXModulesEvent';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { LoadFormConfigurationsRequest } from '../../modules/base-components/webapp/core/LoadFormConfigurationsRequest';
import { ModuleConfigurationService } from '../services/configuration/ModuleConfigurationService';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormConfigurationResolver } from '../services/configuration/FormConfigurationResolver';
import { LoggingService } from '../../../../server/services/LoggingService';
import { LoadFormConfigurationsResponse } from '../../modules/base-components/webapp/core/LoadFormConfigurationsResponse';
import { ISocketRequest } from '../../modules/base-components/webapp/core/ISocketRequest';
import { LoadReleaseInfoResponse } from '../../modules/base-components/webapp/core/LoadReleaseInfoResponse';
import { Socket } from 'socket.io';
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { LoadFormConfigurationRequest } from '../../modules/base-components/webapp/core/LoadFormConfigurationRequest';
import { LoadFormConfigurationResponse } from '../../modules/base-components/webapp/core/LoadFormConfigurationResponse';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SysConfigOptionProperty } from '../../modules/sysconfig/model/SysConfigOptionProperty';
import { SearchOperator } from '../../modules/search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { CacheService } from '../services/cache';
import { ISocketResponse } from '../../modules/base-components/webapp/core/ISocketResponse';

export class KIXModuleNamespace extends SocketNameSpace {

    private static INSTANCE: KIXModuleNamespace;

    public static getInstance(): KIXModuleNamespace {
        if (!KIXModuleNamespace.INSTANCE) {
            KIXModuleNamespace.INSTANCE = new KIXModuleNamespace();
        }
        return KIXModuleNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    private rebuildPromise: Promise<void>;
    private configCache: Map<string, FormConfiguration> = new Map();

    protected getNamespace(): string {
        return 'kixmodules';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(
            client, KIXModulesEvent.LOAD_FORM_CONFIGURATIONS, this.loadFormConfigurations.bind(this)
        );

        this.registerEventHandler(
            client, KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_BY_CONTEXT,
            this.loadFormConfigurationsByContext.bind(this)
        );
        this.registerEventHandler(client, KIXModulesEvent.LOAD_FORM_CONFIGURATIONS,
            this.loadFormConfigurations.bind(this));

        this.registerEventHandler(
            client, KIXModulesEvent.LOAD_FORM_CONFIGURATION,
            this.loadFormConfiguration.bind(this)
        );

        this.registerEventHandler(
            client, KIXModulesEvent.LOAD_RELEASE_INFO,
            this.loadReleaseInfo.bind(this)
        );

        this.registerEventHandler(
            client, KIXModulesEvent.REBUILD_FORM_CONFIG,
            this.rebuildConfiguration.bind(this)
        );
    }

    protected initialize(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['FormConfiguration']);
        return this.rebuildConfigCache();
    }

    private async rebuildConfiguration(
        data: ISocketRequest
    ): Promise<SocketResponse<ISocketResponse | SocketErrorResponse>> {
        await this.rebuildConfigCache().catch((error) => {
            LoggingService.getInstance().error('Error on rebuild form configurations', error);
        });

        const response: ISocketResponse = { requestId: data.requestId };
        return new SocketResponse(KIXModulesEvent.REBUILD_FORM_CONFIG_FINISHED, response);
    }

    public async rebuildConfigCache(): Promise<void> {
        if (!this.rebuildPromise) {
            // eslint-disable-next-line no-async-promise-executor
            this.rebuildPromise = new Promise<void>(async (resolve, reject) => {
                if (CacheService.getInstance().hasCacheBackend()) {
                    await CacheService.getInstance().deleteKeys('FormConfiguration', true);
                } else {
                    this.configCache.clear();
                }

                const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, 'agent-portal'
                    )
                ], null, 0);

                const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                    serverConfig.BACKEND_API_TOKEN, 'FormConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
                    loadingOptions, null
                );

                const options = objectResponse?.objects || [];

                const formOptions = options.filter((c) => c.ContextMetadata === 'Form');

                LoggingService.getInstance().info(`Build ${formOptions.length} form configurations.`);

                for (const formOption of formOptions) {

                    if (formOption.Value) {
                        const newConfig = await FormConfigurationResolver.resolve(
                            serverConfig.BACKEND_API_TOKEN, JSON.parse(formOption.Value), options
                        ).catch((error): FormConfiguration => {
                            LoggingService.getInstance().error(error);
                            LoggingService.getInstance().warning(
                                'Could not resolve form configuration ' + formOption.Name
                            );
                            return null;
                        });

                        if (CacheService.getInstance().hasCacheBackend()) {
                            await CacheService.getInstance().set(formOption.Name, newConfig, 'FormConfiguration');
                        } else {
                            this.configCache.set(formOption.Name, newConfig);
                        }
                    }
                }

                this.rebuildPromise = null;
                resolve();
            });
        }
        return this.rebuildPromise;
    }

    private async loadFormConfigurationsByContext(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse> {
        const formIdsWithContext = await ModuleConfigurationService.getInstance().getFormIDsWithContext();
        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_BY_CONTEXT_FINISHED,
            new LoadFormConfigurationsResponse(data.requestId, formIdsWithContext)
        );
    }

    public async loadFormConfigurations(data: ISocketRequest): Promise<SocketResponse> {
        let formConfigurations: FormConfiguration[] = [];
        if (CacheService.getInstance().hasCacheBackend()) {
            formConfigurations = await CacheService.getInstance().getAll('FormConfiguration');
        } else {
            for (const key of this.configCache) {
                formConfigurations.push(key[1]);
            }
        }

        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
            {
                requestId: data.requestId,
                formConfigurations
            }
        );
    }

    private async loadFormConfiguration(
        data: LoadFormConfigurationRequest
    ): Promise<SocketResponse> {
        let form = CacheService.getInstance().hasCacheBackend()
            ? await CacheService.getInstance().get(data.formId, 'FormConfiguration')
            : this.configCache.get(data.formId);

        if (!form) {
            await this.rebuildConfigCache();
            form = CacheService.getInstance().hasCacheBackend()
                ? await CacheService.getInstance().get(data.formId, 'FormConfiguration')
                : this.configCache.get(data.formId);
        }

        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATION_FINISHED,
            new LoadFormConfigurationResponse(data.requestId, form)
        );
    }

    private async loadReleaseInfo(data: ISocketRequest): Promise<SocketResponse<LoadReleaseInfoResponse>> {
        const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();
        return new SocketResponse(
            KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, new LoadReleaseInfoResponse(data.requestId, releaseInfo)
        );
    }

}
