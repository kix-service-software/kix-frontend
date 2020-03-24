/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import * as chai from 'chai';
import { IServerConfiguration } from '../src/server/model/IServerConfiguration';
import { ConfigurationService } from '../src/server/services/ConfigurationService';


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

    it('Should contain FRONTEND_URL as type of string.', () => {
        expect(serverConfiguration.FRONTEND_URL).to.be.an('string');
    });

    it('Should contain BACKEND_API_URL as type of string.', () => {
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.undefined;
        expect(serverConfiguration.BACKEND_API_URL).to.be.an('string');
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.empty;
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
