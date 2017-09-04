import { IServerConfiguration } from './../model/';

export interface IConfigurationService {

    getServerConfiguration(): IServerConfiguration;

    getLassoConfiguration(): any;

    getComponentConfiguration(configurationName: string): any;

    isProductionMode(): boolean;

    isDevelopmentMode(): boolean;

    isTestMode(): boolean;

}
