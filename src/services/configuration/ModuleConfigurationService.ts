/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration, ConfigurationType } from "../../core/model/configuration";

import {
    Error, KIXObjectType, SysConfigOptionDefinitionProperty, KIXObjectLoadingOptions,
    SysConfigOptionDefinition, FilterCriteria, FilterDataType, FilterType, SysConfigOption
} from "../../core/model";
import { SysConfigService, ConfigurationService, LoggingService } from "../../core/services";
import { SearchOperator } from "../../core/browser";
import { CacheService } from "../../core/cache";

export class ModuleConfigurationService {

    private static INSTANCE: ModuleConfigurationService;

    public static getInstance(): ModuleConfigurationService {
        if (!ModuleConfigurationService.INSTANCE) {
            ModuleConfigurationService.INSTANCE = new ModuleConfigurationService();
        }
        return ModuleConfigurationService.INSTANCE;
    }

    private constructor() { }

    public async cleanUp(token: string): Promise<void> {
        LoggingService.getInstance().info('Cleanup configurations');
        const definitions = await this.loadSysconfigDefinitions(token);
        await SysConfigService.getInstance().deleteObjects(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            definitions.map((d) => d.Name)
        );
    }

    public async saveConfigurations(token: string, configurations: IConfiguration[]): Promise<void> {
        const definitions = await this.loadSysconfigDefinitions(token);

        LoggingService.getInstance().info(`Save/Update ${configurations.length} configurations`);

        for (const config of configurations) {
            const existingDefinition = definitions.find((d) => d.Name === config.id);
            if (!existingDefinition) {
                await this.createConfiguration(token, config);
            }
        }

        await CacheService.getInstance().deleteKeys('ModuleConfigurationService');
    }

    public async saveConfiguration(token: string, configuration: IConfiguration): Promise<void> {
        this.validate(configuration);
        const config = await this.loadConfiguration(token, configuration.id)
            .catch((error) => {
                return null;
            });

        if (config) {
            await this.updateConfiguration(token, configuration);
        } else {
            await this.createConfiguration(token, configuration);
        }

        await CacheService.getInstance().deleteKeys('ModuleConfigurationService');
    }

    public async loadConfiguration<T extends IConfiguration>(token: string, id: string): Promise<T> {
        let configuration: T;

        let options = await CacheService.getInstance().get(
            'ModuleConfigurationService::SysConfigOption', 'ModuleConfigurationService'
        );
        if (!options) {
            options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION, null, null, null
            );
            CacheService.getInstance().set(
                'ModuleConfigurationService::SysConfigOption', options, 'ModuleConfigurationService'
            );
        }

        if (options && options.length) {
            const option = options.find((o) => o.Name === id);
            if (option && option.Value) {
                configuration = JSON.parse(option.Value);
            }
        }

        return configuration;
    }

    public async loadConfigurations<T extends IConfiguration>(
        token: string, type: string | ConfigurationType
    ): Promise<T[]> {
        const definitions = await this.loadSysconfigDefinitions(token, type);
        const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION, null, null, null
        );

        const configurations: T[] = [];
        if (options && options.length) {
            for (const definition of definitions) {
                const option = options.find((o) => o.Name === definition.Name);
                if (option && option.Value) {
                    configurations.push(JSON.parse(option.Value));
                }
            }

        }

        return configurations;
    }

    private async loadSysconfigDefinitions(
        token: string, type?: string | ConfigurationType
    ): Promise<SysConfigOptionDefinition[]> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                SysConfigOptionDefinitionProperty.CONTEXT, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.AND, serverConfig.NOTIFICATION_CLIENT_ID
            )
        ]);

        if (type) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.CONTEXT_METADATA, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, type
                )
            );
        }

        const definitions = await SysConfigService.getInstance().loadObjects<SysConfigOptionDefinition>(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, loadingOptions, null
        );

        return definitions;
    }

    private async updateConfiguration(token: string, configuration: IConfiguration): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        LoggingService.getInstance().info(`Update existing configuration: ${configuration.id}`);
        const name = configuration.name ? configuration.name : configuration.id;
        await SysConfigService.getInstance().updateObject(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            [
                [SysConfigOptionDefinitionProperty.NAME, configuration.id],
                [SysConfigOptionDefinitionProperty.DESCRIPTION, name],
                [SysConfigOptionDefinitionProperty.DEFAULT, JSON.stringify(configuration)],
                [SysConfigOptionDefinitionProperty.CONTEXT, serverConfig.NOTIFICATION_CLIENT_ID],
                [SysConfigOptionDefinitionProperty.CONTEXT_METADATA, configuration.type],
                [SysConfigOptionDefinitionProperty.TYPE, 'String']
            ],
            configuration.id
        ).catch((error: Error) => LoggingService.getInstance().error(error.Code, error));
    }

    private async createConfiguration(token: string, configuration: IConfiguration): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        LoggingService.getInstance().info(`Create new configuration: ${configuration.id}`);
        const name = configuration.name ? configuration.name : configuration.id;
        await SysConfigService.getInstance().createObject(
            token, 'ModuleConfigurationService', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            [
                [SysConfigOptionDefinitionProperty.NAME, configuration.id],
                [SysConfigOptionDefinitionProperty.DESCRIPTION, name],
                [SysConfigOptionDefinitionProperty.DEFAULT, JSON.stringify(configuration)],
                [SysConfigOptionDefinitionProperty.CONTEXT, serverConfig.NOTIFICATION_CLIENT_ID],
                [SysConfigOptionDefinitionProperty.CONTEXT_METADATA, configuration.type],
                [SysConfigOptionDefinitionProperty.TYPE, 'String'],
                [SysConfigOptionDefinitionProperty.IS_REQUIRED, 0]
            ], null, null
        ).catch((error: Error) => LoggingService.getInstance().error(error.Code, error));
    }

    private validate(configuration: IConfiguration): void {
        if (!configuration.id) {
            throw new Error("-1", 'Missing required property id.');
        }

        if (!configuration.type) {
            throw new Error("-1", 'Missing required property type.');
        }
    }

    public async sysconfigChanged(id: string): Promise<void> {
        await CacheService.getInstance().deleteKeys('ModuleConfigurationService');
    }

}
