import * as chai from 'chai';

import { ConfigurationService } from '../src/core/services';
import { IServerConfiguration } from '../src/core/common';

const expect = chai.expect;

/* tslint:disable:no-unused-expression*/
describe('Server Configuration', () => {

    let serverConfiguration: IServerConfiguration;

    before(async () => {
        require('./TestSetup');
        serverConfiguration = ConfigurationService.getInstance().getServerConfiguration();
    });

    it('Should exists.', () => {
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

    it('Should contain PLUGIN_FOLDERS as type of array.', () => {
        expect(serverConfiguration.PLUGIN_FOLDERS).to.not.be.undefined;
        expect(serverConfiguration.PLUGIN_FOLDERS).to.be.an('array');
    });

    it('Should contain FRONTEND_URL as type of string.', () => {
        expect(serverConfiguration.FRONTEND_URL).to.not.be.undefined;
        expect(serverConfiguration.FRONTEND_URL).to.be.an('string');
        expect(serverConfiguration.FRONTEND_URL).to.not.be.empty;
    });

    it('Should contain BACKEND_API_URL as type of string.', () => {
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.undefined;
        expect(serverConfiguration.BACKEND_API_URL).to.be.an('string');
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.empty;
    });

    it('Should contain DEFAULT_MODULE_ID as type of string.', () => {
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.not.be.undefined;
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.be.an('string');
        expect(serverConfiguration.DEFAULT_MODULE_ID).to.not.be.empty;
    });

    it('Should contain SOCKET_TIMEOUT as type of number.', () => {
        expect(serverConfiguration.SOCKET_TIMEOUT).to.not.be.undefined;
        expect(serverConfiguration.SOCKET_TIMEOUT).to.be.an('number');
    });

    it('Should contain FORCE_SSL as type of boolean.', () => {
        expect(serverConfiguration.USE_SSL).to.not.be.undefined;
        expect(serverConfiguration.USE_SSL).to.be.an('boolean');
        expect(serverConfiguration.USE_SSL).to.be.true;
    });

    it('Should contain UPDATE_TRANSLATIONS as type of boolean.', () => {
        expect(serverConfiguration.UPDATE_TRANSLATIONS).to.not.be.undefined;
        expect(serverConfiguration.UPDATE_TRANSLATIONS).to.be.an('boolean');
    });

});
