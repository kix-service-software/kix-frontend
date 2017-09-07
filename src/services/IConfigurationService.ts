import { IServerConfiguration } from './../model/';

export interface IConfigurationService {

    getServerConfiguration(): IServerConfiguration;

    getLassoConfiguration(): any;

    getComponentConfiguration(configurationName: string, userId?: number): any;

    isProductionMode(): boolean;

    isDevelopmentMode(): boolean;

    isTestMode(): boolean;

}
