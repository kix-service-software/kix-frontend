/* tslint:disable no-var-requires no-unused-expression */
import { IConfigurationService } from './../../src/services/';
import { IServerConfiguration, Environment } from './../../src/model/';
import { container } from './../../src/Container';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const configurationService: IConfigurationService = container.get<IConfigurationService>("IConfigurationService");

describe('Configuration Service', () => {

    it('service instance is registered in container.', () => {
        expect(configurationService).not.undefined;
    });

    describe('Server Configuration', () => {
        it('should return a server configuration.', () => {
            const serverConfiguration = configurationService.getServerConfiguration();
            expect(serverConfiguration).not.undefined;
        });
    });

    describe('Lasso Configuration', () => {
        it('should return a lasso configuration', () => {
            const lassoConfiguration = configurationService.getLassoConfiguration();
            expect(lassoConfiguration).not.undefined;
        });
    });

    describe('Environment', () => {
        it('should return production mode true if node environment is not set to development or test.', () => {
            process.env.NODE_ENV = Environment.PRODUCTION;

            const isProductionMode = configurationService.isProductionMode();
            expect(isProductionMode).true;

            const isDevelopmentMode = configurationService.isDevelopmentMode();
            expect(isDevelopmentMode).false;

            const isTestMode = configurationService.isTestMode();
            expect(isTestMode).false;
        });

        it('should return development mode true if node environment is set to development.', () => {
            process.env.NODE_ENV = Environment.DEVELOPMENT;

            const isProductionMode = configurationService.isProductionMode();
            expect(isProductionMode).false;

            const isDevelopmentMode = configurationService.isDevelopmentMode();
            expect(isDevelopmentMode).true;

            const isTestMode = configurationService.isTestMode();
            expect(isTestMode).false;
        });

        it('should return test mode true if node environment is set to test.', () => {
            process.env.NODE_ENV = Environment.TEST;

            const isProductionMode = configurationService.isProductionMode();
            expect(isProductionMode).false;

            const isDevelopmentMode = configurationService.isDevelopmentMode();
            expect(isDevelopmentMode).false;

            const isTestMode = configurationService.isTestMode();
            expect(isTestMode).true;
        });
    });

});
