import { IServerConfiguration } from './../model/';

export interface IConfigurationService {

    getServerConfiguration(): IServerConfiguration;

    getLassoConfiguration(): any;

    getComponentConfiguration(configurationName: string): any;

    saveComponentConfiguration(configurationName: string, configuration: any): Promise<void>;

    isProductionMode(): boolean;

    isDevelopmentMode(): boolean;

    isTestMode(): boolean;

}
