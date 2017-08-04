import * as chai from 'chai';
import { IServerConfiguration } from './../../dist/model/configuration/IServerConfiguration.d';

describe('Server Configuration', () => {

    const serverConfiguration: IServerConfiguration = require('../../server.config.json');

    it('Should exists', () => {
        chai.expect(serverConfiguration).to.not.be.undefined;
    });

    it('Should contain SERVER_PORT as type of number.', () => {
        chai.expect(serverConfiguration.SERVER_PORT).to.not.be.undefined;
        chai.expect(serverConfiguration.SERVER_PORT).to.be.an('number');
    });

});