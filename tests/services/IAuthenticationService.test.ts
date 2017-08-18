/* tslint:disable no-var-requires no-unused-expression */
import {
    HttpService,
    IAuthenticationService,
    IHttpService,
    IConfigurationService
} from './../../src/services/';
import { HttpError, UserType } from './../../src/model/';
import { Request, Response } from 'express';
import chaiAsPromised = require('chai-as-promised');
import MockAdapter = require('axios-mock-adapter');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

import { container } from "./../../src/Container";

const httpService: IHttpService = container.get<IHttpService>("IHttpService");
const axios = require('axios');

const authenticationService: IAuthenticationService = container.get<IAuthenticationService>("IAuthenticationService");
const configurationService: IConfigurationService = container.get<IConfigurationService>("IConfigurationService");

const apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;

describe('Authentication Service', () => {
    let mock;

    before(() => {
        mock = new MockAdapter(axios);
    });

    after(() => {
        mock.restore();
    });

    it('service instance is registered in container.', () => {
        expect(authenticationService).not.undefined;
    });

    describe('Login', () => {

        describe('Create a valid login request.', async () => {
            before(() => {
                mock.onPost(apiURL + '/sessions', {
                    UserLogin: 'agent',
                    Password: 'agent',
                    UserType: UserType.AGENT
                }).reply(200, { token: 'ABCDEFG12345' });
            });

            after(() => {
                mock.reset();
            });

            it('should return a token if valid agent credentials are given', async () => {
                const response = await authenticationService.login('agent', 'agent', UserType.AGENT);
                expect(response).equal('ABCDEFG12345');
            });
        });

        describe('Create a valid login request.', async () => {
            before(() => {
                mock.onPost(apiURL + '/sessions', {
                    UserLogin: 'customer',
                    Password: 'customer',
                    UserType: UserType.CUSTOMER
                }).reply(200, { token: 'ABCDEFG12345' });
            });

            after(() => {
                mock.reset();
            });

            it('should return a token if valid customer credentials are given', async () => {
                const response = await authenticationService.login('customer', 'customer', UserType.CUSTOMER);
                expect(response).equal('ABCDEFG12345');
            });
        });
        describe('Create a valid login request.', async () => {
            before(() => {
                mock.onPost(apiURL + '/sessions', {
                    UserLogin: 'wrong',
                    Password: 'wrong',
                    UserType: UserType.AGENT
                }).reply(400, { error: 'Wrong credentials.' });
            });

            after(() => {
                mock.reset();
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
                mock.onDelete(apiURL + '/sessions/ABCDEFG123456')
                    .reply(200);
            });

            after(() => {
                mock.reset();
            });

            it('should do a logout.', async () => {
                const response = await authenticationService.logout('ABCDEFG123456');
                expect(response).true;
            });
        });
    });

    describe('isAuthenticated Middleware', () => {

        it('should call the next method if a valid authorization header is given.', async () => {
            const request: Request = {
                headers: {
                    authorization: 'Token ABCDEFG'
                }
            };
            const response: Response = {};

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
