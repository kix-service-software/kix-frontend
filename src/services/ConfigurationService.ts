import {
    Environment,
    IServerConfiguration,
    IConfigurationService,
    ILoggingService
} from '@kix/core';
import { injectable, inject } from 'inversify';

import jsonfile = require('jsonfile');
import fs = require('fs');

@injectable()
export class ConfigurationService implements IConfigurationService {

    private serverConfiguration: IServerConfiguration;
    private lassoConfiguration: any;

    private CONFIG_DIR: string = '../../config/';
    private CONFIG_COMPONENTS_DIR: string = '../../config/components/';
    private CONFIG_EXTENSION: string = '.config.json';

    public constructor() {
        let lassoConfig = this.getConfigurationFilePath('lasso.dev');

        // TODO: split server.config to prod and dev?
        const serverConfig = this.getConfigurationFilePath('server');

        if (this.isProductionMode()) {
            lassoConfig = this.getConfigurationFilePath('lasso.prod');
        }

        this.serverConfiguration = this.loadServerConfig(serverConfig);

        this.clearRequireCache(lassoConfig);
        this.lassoConfiguration = require(lassoConfig);
    }

    public getServerConfiguration(): IServerConfiguration {
        return this.serverConfiguration;
    }

    public getLassoConfiguration(): any {
        return this.lassoConfiguration;
    }

    public async getComponentConfiguration(
        contextId: string, componentId: string, instanceId: string, userId: number): Promise<any> {

        const configurationFileName = this.buildConfigurationFileName(contextId, userId);
        const filePath = this.getComponentConfigurationFilePath(configurationFileName);
        const configurationFile = this.getConfigurationFile(filePath);

        if (componentId === null) {
            componentId = contextId;
        }

        if (instanceId) {
            componentId = componentId + "-" + instanceId;
        }

        return configurationFile[componentId];
    }

    public async saveComponentConfiguration(
        contextId: string, componentId: string, instanceId: string, userId: number, configuration: any): Promise<void> {

        if (componentId === null) {
            componentId = contextId;
        }

        if (instanceId) {
            componentId = componentId + "-" + instanceId;
        }

        const configurationFileName = this.buildConfigurationFileName(contextId, userId);

        await new Promise<void>((resolve, reject) => {
            const filePath = __dirname + '/' + this.getComponentConfigurationFilePath(configurationFileName);

            const configurationFile = this.getConfigurationFile(filePath);
            configurationFile[componentId] = configuration;

            jsonfile.writeFile(filePath, configurationFile,
                (fileError: Error) => {
                    if (fileError) {
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    public isProductionMode(): boolean {
        const environment = this.getEnvironment();
        return environment === Environment.PRODUCTION ||
            (environment !== Environment.DEVELOPMENT && environment !== Environment.TEST);
    }

    public isDevelopmentMode(): boolean {
        return this.getEnvironment() === Environment.DEVELOPMENT;
    }

    public isTestMode(): boolean {
        return this.getEnvironment() === Environment.TEST;
    }

    private getEnvironment(): string {
        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv) {
            nodeEnv = Environment.PRODUCTION;
        }

        return nodeEnv.toLocaleLowerCase();
    }

    private loadServerConfig(serverConfig: string): IServerConfiguration {
        this.clearRequireCache(serverConfig);
        const config: IServerConfiguration = require(serverConfig);

        // check if config option has been overridden by environment
        for (const key in config) {
            if (process.env[key]) {
                switch (typeof config[key]) {
                    case "number": {
                        config[key] = Number(process.env[key]);
                        break;
                    }
                    case "boolean": {
                        config[key] = Boolean(process.env[key]);
                        break;
                    }
                    case "object": {
                        config[key] = Object(process.env[key].split(/\s+/));
                        break;
                    }
                    default: {
                        config[key] = process.env[key];
                    }
                }
            }
        }
        return config;
    }

    private getConfigurationFilePath(fileName: string): string {
        return this.CONFIG_DIR + fileName + this.CONFIG_EXTENSION;
    }

    private getComponentConfigurationFilePath(fileName: string): string {
        return this.CONFIG_COMPONENTS_DIR + fileName + this.CONFIG_EXTENSION;
    }

    private buildConfigurationFileName(contextId: string, userId: number): string {
        let configurationFileName = contextId;

        if (userId) {
            configurationFileName = userId + '_' + configurationFileName;
        }

        return configurationFileName;
    }

    private getConfigurationFile(filePath: string): any {
        let configurationFile = null;
        if (fs.existsSync(filePath)) {
            this.clearRequireCache(filePath);
            configurationFile = require(filePath);
        } else {
            configurationFile = {};
        }
        return configurationFile;
    }

    private clearRequireCache(configPath: string): void {
        try {
            const config = require.resolve(configPath);
            if (require.cache[config]) {
                delete require.cache[config];
            }
        } catch (error) {
            return;
        }
    }

}
