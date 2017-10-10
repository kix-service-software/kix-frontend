/* tslint:disable no-var-requires no-unused-expression */
import {
    IAuthenticationService,
    IHttpService,
    IConfigurationService,
    HttpError,
    UserType
} from '@kix/core/';
import { Request, Response } from 'express';
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

import { container } from "../../../src/Container";

describe('Authentication Service', () => {
    let nockScope;
    let httpService: IHttpService;
    let authenticationService: IAuthenticationService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        httpService = container.getDIContainer().get<IHttpService>("IHttpService");
        authenticationService = container.getDIContainer().get<IAuthenticationService>("IAuthenticationService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");

        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(authenticationService).not.undefined;
    });

    describe('Login', () => {

        describe('Create a valid agent login request.', async () => {

            before(() => {
                nockScope
                    .post('/sessions', {
                        UserLogin: 'agent',
                        Password: 'agent',
                        UserType: UserType.AGENT
                    })
                    .reply(200, { Token: 'ABCDEFG12345' });
            });

            it('should return a token if valid agent credentials are given', async () => {
                const response = await authenticationService.login('agent', 'agent', UserType.AGENT);
                expect(response).equal('ABCDEFG12345');
            });
        });

        describe('Create a valid customer login request.', async () => {

            before(() => {
                nockScope
                    .post('/sessions', {
                        UserLogin: 'customer',
                        Password: 'customer',
                        UserType: UserType.CUSTOMER
                    })
                    .reply(200, { Token: 'ABCDEFG12345' });
            });

            it('should return a token if valid customer credentials are given', async () => {
                const response = await authenticationService.login('customer', 'customer', UserType.CUSTOMER);
                expect(response).equal('ABCDEFG12345');
            });
        });

        describe('Create a invalid login request.', async () => {


            before(() => {
                nockScope
                    .post('/sessions', {
                        UserLogin: 'wrong',
                        Password: 'wrong',
                        UserType: UserType.AGENT
                    })
                    .reply(400, { error: 'Wrong credentials.' });
            });

            it('should return a correct http error if incorrect credentials are provided.', async () => {
                const response = await authenticationService.login('wrong', 'wrong', UserType.AGENT)
                    .catch((error: HttpError) => {
                        expect(error).to.not.undefined;
                        expect(error.status).equal(400);
                    });
            });
        });

    });

    describe('Logout', () => {
        describe('Create a valid logout reqeuest.', () => {

            before(() => {
                nockScope
                    .delete('/sessions/ABCDEFG123456')
                    .reply(200);
            });

            it('should do a logout.', async () => {
                const response = await authenticationService.logout('ABCDEFG123456');
                expect(response).true;
            });
        });
    });

    describe('isAuthenticated Middleware', () => {

        before(() => {
            nockScope
                .get('/session')
                .reply(200, { Session: {} });
        });

        it('should call the next method if a valid authorization header is given.', async () => {
            const request: Request = {
                headers: {
                    authorization: 'Token ABCDEFG'
                }
            };

            const response: Response = {
                redirect: (target) => {
                    expect(true).false;
                }
            };

            authenticationService.isAuthenticated(request, response, () => {
                expect(true);
            });
        });

        it('should redirect the response if no authorization header is given.', async () => {
            const request: Request = {
                headers: {
                }
            };
            const response: Response = {
                redirect: (target) => {
                    expect(true);
                }
            };

            authenticationService.isAuthenticated(request, response, () => {
                expect(false).equals(true, 'Next should not be called in this test case!');
            });
        });

        it('should redirect the response if incorrect token prefix is given.', async () => {
            const request: Request = {
                headers: {
                    authorization: 'WrongToken ABCDEFG'
                }
            };
            const response: Response = {
                redirect: (target) => {
                    expect(true);
                }
            };

            authenticationService.isAuthenticated(request, response, () => {
                expect(false).equals(true, 'Next should not be called in this test case!');
            });
        });
    });

});
