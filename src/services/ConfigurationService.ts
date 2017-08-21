import { Environment, IServerConfiguration } from './../model/';
import { IConfigurationService } from './IConfigurationService';
import { injectable } from 'inversify';

@injectable()
export class ConfigurationService implements IConfigurationService {

    private serverConfiguration: IServerConfiguration;

    private lassoConfiguration: any;

    public constructor() {
        let lassoConfig = '../../lasso.dev.config.json';

        // TODO: split server.config to prod and dev?
        const serverConfig = '../../server.config.json';

        if (this.isProductionMode()) {
            lassoConfig = '../../lasso.prod.config.json';
        }

        this.serverConfiguration = this.loadServerConfig(serverConfig);
        this.lassoConfiguration = require(lassoConfig);
    }

    public getServerConfiguration(): IServerConfiguration {
        return this.serverConfiguration;
    }

    public getLassoConfiguration(): any {
        return this.lassoConfiguration;
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
        const config: IServerConfiguration = require(serverConfig);
        // check if config option has been overridden by environment
        Object.keys(config).forEach((key) => {
            if (process.env[key]) {
                config[key] = process.env[key];
            }
        });
        return config;
    }

}
