import { IServerConfiguration, ServiceContainer } from '@kix/core/dist/common';
import { IConfigurationService } from '@kix/core/dist/services';
import * as chai from 'chai';

const expect = chai.expect;

/* tslint:disable:no-unused-expression*/
describe('Server Configuration', () => {

    let configurationService: IConfigurationService;
    let serverConfiguration: IServerConfiguration;

    before(async () => {
        require('../TestSetup');
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        serverConfiguration = configurationService.getServerConfiguration();
    });

    it('Should exists', () => {
        expect(serverConfiguration).to.not.be.undefined;
    });

    it('Should contain HTTP_PORT as type of number.', () => {
        expect(serverConfiguration.HTTP_PORT).to.not.be.undefined;
        expect(serverConfiguration.HTTP_PORT).to.be.an('number');
    });

    it('Should contain HTTPS_PORT as type of number.', () => {
        expect(serverConfiguration.HTTPS_PORT).to.not.be.undefined;
        expect(serverConfiguration.HTTPS_PORT).to.be.an('number');
    });

    it('Should contain PLUGIN_FOLDERS as type of array', () => {
        expect(serverConfiguration.PLUGIN_FOLDERS).to.not.be.undefined;
        expect(serverConfiguration.PLUGIN_FOLDERS).to.be.an('array');
    });

    it('Should contain FRONTEND_URL as type of string', () => {
        expect(serverConfiguration.FRONTEND_URL).to.not.be.undefined;
        expect(serverConfiguration.FRONTEND_URL).to.be.an('string');
        expect(serverConfiguration.FRONTEND_URL).to.not.be.empty;
    });

    it('Should contain BACKEND_API_URL as type of string', () => {
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.undefined;
        expect(serverConfiguration.BACKEND_API_URL).to.be.an('string');
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.empty;
    });

    it('Should contain DEFAULT_MODULE_ID as type of string', () => {
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.not.be.undefined;
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.be.an('string');
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.not.be.empty;
    });
});
