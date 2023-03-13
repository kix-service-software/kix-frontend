/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from './KIXObjectAPIService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SortOrder } from '../../model/SortOrder';
import { ClientRegistration } from '../model/ClientRegistration';
import { ClientRegistrationsResponse } from '../model/ClientRegistrationsResponse';
import { LoggingService } from '../../../../server/services/LoggingService';
import { CreateClientRegistrationResponse } from '../model/CreateClientRegistrationResponse';
import { CreateClientRegistrationRequest } from '../model/CreateClientRegistrationRequest';
import { CreateClientRegistration } from '../model/CreateClientRegistration';
import { SystemInfo } from '../../model/SystemInfo';
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { PluginService } from '../../../../server/services/PluginService';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { SysConfigAccessLevel } from '../../modules/sysconfig/model/SysConfigAccessLevel';
import { SysConfigKey } from '../../modules/sysconfig/model/SysConfigKey';
import { SysConfigOptionDefinition } from '../../modules/sysconfig/model/SysConfigOptionDefinition';
import { TranslationAPIService } from '../../modules/translation/server/TranslationService';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { IConfigurationExtension } from '../extensions/IConfigurationExtension';
import { IFormConfigurationExtension } from '../extensions/IFormConfigurationExtension';
import { IModifyConfigurationExtension } from '../extensions/IModifyConfigurationExtension';
import { Error } from '../../../../server/model/Error';
import { ModuleConfigurationService } from './configuration/ModuleConfigurationService';

export class ClientRegistrationService extends KIXObjectAPIService {

    private static INSTANCE: ClientRegistrationService;

    public static getInstance(): ClientRegistrationService {
        if (!ClientRegistrationService.INSTANCE) {
            ClientRegistrationService.INSTANCE = new ClientRegistrationService();
        }
        return ClientRegistrationService.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected RESOURCE_URI: string = 'clientregistrations';

    public objectType: KIXObjectType | string = KIXObjectType.CLIENT_REGISTRATION;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.CLIENT_REGISTRATION;
    }

    public async getClientRegistrations(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ClientRegistration[]> {

        const httpResponse = await this.getObjects<ClientRegistrationsResponse>(
            token, limit, order, changedAfter, query
        );

        return httpResponse?.responseData?.ClientRegistration;
    }

    public async submitClientRegistration(
        token: string, clientRequestId: string, createClientRegistration: CreateClientRegistration
    ): Promise<SystemInfo> {

        const uri = this.buildUri(this.RESOURCE_URI, createClientRegistration.ClientID);
        await this.sendDeleteRequest(token, clientRequestId, [uri], null)
            .catch(
                (error) => LoggingService.getInstance().debug(
                    'Could not delete client registration: ' + createClientRegistration.ClientID
                )
            );

        const response =
            await this.sendCreateRequest<CreateClientRegistrationResponse, CreateClientRegistrationRequest>(
                token, clientRequestId,
                this.RESOURCE_URI, new CreateClientRegistrationRequest(createClientRegistration),
                null
            );

        return response.SystemInfo;
    }

    public async deleteClientRegistration(token: string, clientRequestId: string, clientId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, clientId);
        await this.sendDeleteRequest<void>(token, clientRequestId, [uri], null);
    }

    public async createClientRegistration(backendAuthenticationToken: string): Promise<void> {
        LoggingService.getInstance().info('[CLIENT REGISTRATION] Start');
        const start = Date.now();

        let poDefinitions = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const updateTranslations = serverConfig.UPDATE_TRANSLATIONS;
        if (updateTranslations) {
            LoggingService.getInstance().info('Update translations');
            poDefinitions = await TranslationAPIService.getInstance().getPODefinitions();
        }

        const configurations = await this.createDefaultConfigurations();

        const backendDependencies = this.getBackendDependencies();
        const plugins = this.getPlugins();

        const createClientRegistration = new CreateClientRegistration(
            serverConfig.NOTIFICATION_CLIENT_ID,
            serverConfig.NOTIFICATION_URL,
            serverConfig.NOTIFICATION_INTERVAL,
            'Token ' + backendAuthenticationToken,
            poDefinitions,
            configurations,
            backendDependencies,
            plugins,
            {
                SystemInfo: 1
            }
        );

        const systemInfo = await this.submitClientRegistration(
            serverConfig.BACKEND_API_TOKEN, null, createClientRegistration
        ).catch((error) => {
            LoggingService.getInstance().error(error);
            LoggingService.getInstance().error(
                'Failed to register frontent server at backend (ClientRegistration). See errors above.'
            );
            process.exit(1);
        });

        ReleaseInfoUtil.getInstance().setSysteminfo(systemInfo as SystemInfo);
        const end = Date.now();
        LoggingService.getInstance().info(`[CLIENT REGISTRATION] Finished in ${(end - start) / 1000}s`);
    }

    private async createDefaultConfigurations(): Promise<SysConfigOptionDefinition[]> {
        LoggingService.getInstance().info('Create Default Configurations');
        const extensions = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            AgentPortalExtensions.CONFIGURATION
        ).catch((): IConfigurationExtension[] => []);

        if (extensions) {
            LoggingService.getInstance().info(`Found ${extensions.length} configuration extensions`);

            let configurations: IConfiguration[] = [];
            for (const extension of extensions) {
                let formConfigurations = await extension.getFormConfigurations().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );
                let defaultConfigurations = await extension.getDefaultConfiguration().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );

                formConfigurations = formConfigurations || [];

                defaultConfigurations = defaultConfigurations || [];

                configurations = [
                    ...configurations,
                    ...formConfigurations,
                    ...defaultConfigurations
                ];
            }

            await ModuleConfigurationService.getInstance().applyFormConfigurationsToCache();

            await this.extendFormConfigurations(configurations);
            configurations = await this.handleConfigurationExtensions(configurations);

            ConfigurationService.getInstance().getServerConfiguration();

            const sysconfigOptionDefinitions = configurations.map((c) => {
                const name = c.name ? c.name : c.id;
                const definition: any = {
                    AccessLevel: SysConfigAccessLevel.INTERNAL,
                    Name: c.id,
                    Description: name,
                    Default: JSON.stringify(c),
                    Context: c.application || 'kix-frontend-unknown',
                    ContextMetadata: c.type,
                    Type: 'String',
                    IsRequired: 0,
                    ValidID: c.valid ? 1 : 2,
                };
                return definition;
            });

            const browserTimeoutConfig: any = {
                AccessLevel: SysConfigAccessLevel.INTERNAL,
                Name: SysConfigKey.BROWSER_SOCKET_TIMEOUT_CONFIG,
                Description: 'Timeout (in ms) configuration for socket requests.',
                Default: '30000',
                Context: 'agent-portal',
                ContextMetadata: 'agent-portal-configuration',
                Type: 'String',
                IsRequired: 0
            };
            sysconfigOptionDefinitions.push(browserTimeoutConfig);

            const setupAssistantConfig: any = {
                AccessLevel: SysConfigAccessLevel.INTERNAL,
                Name: SysConfigKey.SETUP_ASSISTANT_STATE,
                Description: 'The state of the setup steps for the agent portal setup assistant.',
                Default: JSON.stringify([]),
                Context: 'agent-portal',
                ContextMetadata: 'agent-portal-configuration',
                Type: 'String',
                IsRequired: 0
            };
            sysconfigOptionDefinitions.push(setupAssistantConfig);

            return sysconfigOptionDefinitions;
        }
    }

    private getBackendDependencies(): any[] {
        let dependencies = [];
        const plugins = PluginService.getInstance().availablePlugins;
        for (const plugin of plugins) {
            dependencies = [
                ...dependencies,
                ...plugin[1].dependencies
                    .filter((d) => d[0].startsWith('backend::'))
                    .map((d) => {
                        return {
                            Product: d[0].replace('backend::', ''),
                            Operator: d[1],
                            BuildNumber: Number(d[2])
                        };
                    })
            ];
        }
        return dependencies;
    }

    private async extendFormConfigurations(formConfigurations: IConfiguration[]): Promise<void> {
        if (formConfigurations.length) {
            const extensions = await PluginService.getInstance().getExtensions<IFormConfigurationExtension>(
                AgentPortalExtensions.EXTENDED_FORM_CONFIGURATION
            );

            for (const formExtension of extensions) {
                const extendedFormFields = await formExtension.getFormFieldExtensions();

                for (const fieldExtension of extendedFormFields) {
                    const configuration = formConfigurations.find((c) => c.id === fieldExtension.groupId);
                    if (configuration) {
                        const groupConfiguration = configuration as FormGroupConfiguration;
                        if (!groupConfiguration.fieldConfigurationIds) {
                            groupConfiguration.fieldConfigurationIds = [];
                        }

                        const index = groupConfiguration.fieldConfigurationIds.findIndex(
                            (id) => id === fieldExtension.afterFieldId
                        );
                        if (index !== -1) {
                            groupConfiguration.fieldConfigurationIds.splice(
                                index + 1, 0, fieldExtension.configuration.id
                            );
                        } else {
                            groupConfiguration.fieldConfigurationIds.push(fieldExtension.configuration.id);
                        }

                        formConfigurations.push(fieldExtension.configuration);
                    }
                }
            }
        }
    }

    private async handleConfigurationExtensions(configurations: IConfiguration[]): Promise<IConfiguration[]> {
        if (configurations.length) {
            const extensions = await PluginService.getInstance().getExtensions<IModifyConfigurationExtension>(
                AgentPortalExtensions.MODIFY_CONFIGURATION
            );

            for (const extension of extensions) {
                configurations = await extension.modifyConfigurations(configurations);
            }
        }

        return configurations;
    }

    private getPlugins(): any[] {
        const plugins = [];
        const availablePlugins = PluginService.getInstance().availablePlugins;
        for (const plugin of availablePlugins) {
            plugins.push({
                Product: plugin[1].product,
                Requires: plugin[1].requires,
                Description: plugin[1].product,
                BuildNumber: plugin[1].buildNumber,
                PatchNumber: plugin[1].patchNumber,
                Version: plugin[1].version,
                ExtendedData: {
                    BuildDate: plugin[1].buildDate
                }
            });
        }
        return plugins;
    }
}
