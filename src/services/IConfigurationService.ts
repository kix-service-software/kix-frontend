import { IServerConfiguration } from './../model/';

export interface IConfigurationService {

    getServerConfiguration(): IServerConfiguration;

    getLassoConfiguration(): any;

    isProductionMode(): boolean;

    isDevelopmentMode(): boolean;

    isTestMode(): boolean;

}
