import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { doSSOLogin } from '../routes/SSOAuthentication';
import { UserType } from '../../modules/user/model/UserType';
import { APIHeader } from '../api/APIHeader';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { IncomingHttpHeaders } from 'http';
import { MFAToken } from '../../modules/multifactor-authentication/model/MFAToken';
import { FastifyRequest } from 'fastify';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SSO Authentication', () => {

    describe('Request with empty cookies and headers (initial site call)', () => {
        const request = {
            cookies: {},
            headers: {}
        };

        const reply = {
            cookie: (name: string, value: any, options: any) => {
                expect(name).equals('authNegotiationDone');
                expect(value).true;
                expect(options.httpOnly).true;
                expect(options.path).equals('/');
            },
            header: (name: string, value: string) => {
                expect(name).equals('WWW-Authenticate');
                expect(value).equals('Negotiate');
            },
            status: (code: number) => {
                expect(code).equals(401);
            },
            type: (contentType: string) => {
                expect(contentType).equals('text/html; charset=utf-8');
            },
            send: (content: string) => {
                expect(typeof content === 'string').true;
            }
        }

        it('Should redirect to auth page and start negotiation process.', async () => {
            const ssoSuccess = await doSSOLogin(request as any, reply as any, true, '', UserType.AGENT);
            expect(ssoSuccess).true;
        })

    });

    describe('Request with authNegotiationDone cookie but without authorization', () => {
        const request = {
            cookies: {
                authNegotiationDone: true
            },
            headers: {}
        };

        const reply = {}

        it('Should return false -> Login Page should be loaded.', async () => {
            const ssoSuccess = await doSSOLogin(request as any, reply as any, true, '', UserType.AGENT);
            expect(ssoSuccess).false;
        })

    });

    describe('Request with authNoSSO cookie but without authorization', () => {
        const request = {
            cookies: {
                authNoSSO: true
            },
            headers: {}
        };

        const reply = {}

        it('Should return false -> Login Page should be loaded.', async () => {
            const ssoSuccess = await doSSOLogin(request as any, reply as any, true, '', UserType.AGENT);
            expect(ssoSuccess).false;
        })

    });

    describe('Request with Negotiate authorization header', () => {
        let originalLogin;
        let originalSetSessionCookie;

        before(() => {
            originalLogin = AuthenticationService.getInstance().login;
            originalSetSessionCookie = AuthenticationService.setSessionCookie;

            AuthenticationService.getInstance().login = async (
                login: string, password: string, userType: UserType,
                negotiateToken: string, mfaToken: MFAToken,
                clientRequestId: string, headers: IncomingHttpHeaders, fakeLogin?: boolean,
                additionalData?: any
            ): Promise<string> => {
                expect(login).equals('');
                expect(password).null;
                expect(userType).equals(UserType.AGENT);
                expect(negotiateToken).equals('negotiationToken');
                expect(mfaToken).null;
                expect(clientRequestId).null;
                expect(headers).null;
                expect(fakeLogin).false;
                expect(additionalData).undefined;
                return '1234567890';
            }

            AuthenticationService.setSessionCookie = (request: FastifyRequest, application: string, token: string): void => {
                expect(request).not.undefined;
                expect(application).equals('agent-portal');
                expect(token).equals('1234567890');
            }
        });

        const request = {
            cookies: {},
            headers: {
                authorization: 'Negotiate negotiationToken'
            },
            query: {
                redirectUrl: encodeURIComponent('/tickets/3')
            }
        };

        const reply = {
            redirect: (route: string) => {
                expect(route).equals('/tickets/3');
            }
        }

        it('Should return true and redirect to redirectUrl.', async () => {
            const ssoSuccess = await doSSOLogin(request as any, reply as any, true, '', UserType.AGENT, 'agent-portal');
            expect(ssoSuccess).true;
        });

        after(() => {
            AuthenticationService.getInstance().login = originalLogin;
            AuthenticationService.setSessionCookie = originalSetSessionCookie;
        })

    });
});