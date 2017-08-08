
import { IServerConfiguration } from './../../src/model/configuration/IServerConfiguration';
import * as chai from 'chai';

/* tslint:disable:no-unused-expression*/
describe('Server Configuration', () => {

    const serverConfiguration: IServerConfiguration = require('../../server.config.json');

    it('Should exists', () => {
        chai.expect(serverConfiguration).to.not.be.undefined;
    });

    it('Should contain SERVER_PORT as type of number.', () => {
        chai.expect(serverConfiguration.SERVER_PORT).to.not.be.undefined;
        chai.expect(serverConfiguration.SERVER_PORT).to.be.an('number');
    });

    it('Should contain PLUGIN_FOLDERS as type of array', () => {
        chai.expect(serverConfiguration.PLUGIN_FOLDERS).to.not.be.undefined;
        chai.expect(serverConfiguration.PLUGIN_FOLDERS).to.be.an('array');
    });

    it('Should contain BACKEND_API_HOST as type of string', () => {
        chai.expect(serverConfiguration.BACKEND_API_HOST).to.not.be.undefined;
        chai.expect(serverConfiguration.BACKEND_API_HOST).to.be.an('string');
        chai.expect(serverConfiguration.BACKEND_API_HOST).to.not.be.empty;
    });
});
