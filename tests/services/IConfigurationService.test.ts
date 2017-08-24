/* tslint:disable no-var-requires no-unused-expression */
import { ConfigurationService } from './../../src/services/ConfigurationService';
import { IConfigurationService } from './../../src/services/';
import { IServerConfiguration, Environment, LogLevel } from './../../src/model/';
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

    describe('Overwrite configuration from environment', () => {
        let serverConfig: IServerConfiguration;

        describe('Overwrite string values', () => {
            before(() => {
                process.env.BACKEND_API_URL = 'http://test:4321';
                process.env.LOG_FILEDIR = '/logdir/test';

                const configService = new ConfigurationService();
                serverConfig = configService.getServerConfiguration();

                delete process.env.BACKEND_API_URL;
            });

            it('BACKEND_API_URL should have the value of the environment variable', () => {
                expect(serverConfig.BACKEND_API_URL).equal('http://test:4321');
            });

            it('LOG_FILEDIR should have the value of the environment variable', () => {
                expect(serverConfig.LOG_FILEDIR).equal('/logdir/test');
            });
        });

        describe('Overwrite number values', () => {
            before(() => {
                process.env.SERVER_PORT = '9876';
                process.env.LOG_LEVEL = LogLevel.DEBUG.toString();

                const configService = new ConfigurationService();
                serverConfig = configService.getServerConfiguration();

                delete process.env.SERVER_PORT;
                delete process.env.LOG_LEVEL;
            });

            it('SERVER_PORT should have the value of the environment variable', () => {
                expect(serverConfig.SERVER_PORT).equal(9876);
            });

            it('LOG_LEVEL should have the value of the environment variable', () => {
                expect(serverConfig.LOG_LEVEL).equal(LogLevel.DEBUG);
            });
        });

        describe('Overwrite array values', () => {
            before(() => {
                process.env.PLUGIN_FOLDERS = 'A B C D';

                const configService = new ConfigurationService();
                serverConfig = configService.getServerConfiguration();
                delete process.env.PLUGIN_FOLDERS;
            });

            it('PLUGIN_FOLDERS should have the value of the environment variable', () => {
                expect(serverConfig.PLUGIN_FOLDERS).an('array');
                expect(serverConfig.PLUGIN_FOLDERS).contain('A');
                expect(serverConfig.PLUGIN_FOLDERS).contain('B');
                expect(serverConfig.PLUGIN_FOLDERS).contain('C');
                expect(serverConfig.PLUGIN_FOLDERS).contain('D');
            });
        });
    });

});
