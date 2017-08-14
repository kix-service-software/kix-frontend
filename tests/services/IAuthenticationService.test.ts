import { HttpService, IHttpService, AuthenticationService, IAuthenticationService } from './../../src/services/';
import { HttpError, UserType } from './../../src/model/';
/* tslint:disable no-var-requires no-unused-expression */
import chaiAsPromised = require('chai-as-promised');
import MockAdapter = require('axios-mock-adapter');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const axios = require('axios');
const mock = new MockAdapter(axios);

const httpService: IHttpService = new HttpService();
const authenticationService: IAuthenticationService = new AuthenticationService(httpService);

const apiURL = require('../../server.config.json').BACKEND_API_URL;

describe('Authentication Service', () => {

    describe('Login', () => {

        before((done) => {
            mock.onPost(apiURL + '/auth/login', { UserLogin: 'test', Password: 'test', UserType: UserType.AGENT })
                .reply(200, { token: 'ABCDEFG12345' });

            done();
        });

        it('should return a token if valid credentials are given', async () => {
            const response = await authenticationService.login('test', 'test', UserType.AGENT);
            expect(response).to.equal('ABCDEFG12345');
        });

    });

});
