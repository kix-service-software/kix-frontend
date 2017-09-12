import { ILoggingService } from './ILoggingService';
import { Environment, IServerConfiguration } from './../model/';
import { IConfigurationService } from './IConfigurationService';
import { injectable, inject } from 'inversify';

import jsonfile = require('jsonfile');

@injectable()
export class ConfigurationService implements IConfigurationService {

    private serverConfiguration: IServerConfiguration;
    private lassoConfiguration: any;

    private CONFIG_DIR: string = '../../config/';
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

    public getComponentConfiguration(configurationName: string): any {
        const configPath = this.getConfigurationFilePath(configurationName);
        this.clearRequireCache(configPath);
        return require(configPath);
    }

    public async saveComponentConfiguration(configurationName: string, configuration: any): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const filePath = this.getConfigurationFilePath(configurationName);

            jsonfile.writeFile(filePath, configuration,
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

    private clearRequireCache(configPath: string): void {
        if (require.cache[configPath]) {
            delete require.cache[configPath];
        }
    }

}
