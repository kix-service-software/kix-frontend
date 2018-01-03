/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    MailAccountResponse,
    MailAccountsResponse,
    CreateMailAccount,
    CreateMailAccountRequest,
    CreateMailAccountResponse,
    UpdateMailAccount,
    UpdateMailAccountRequest,
    UpdateMailAccountResponse,
    SortOrder
} from '@kix/core/dist/api';

import { MailAccount } from '@kix/core/dist/model';
import { IMailAccountService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/mailAccounts";

describe('MailAccount Service', () => {
    let nockScope;
    let mailAccountService: IMailAccountService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        mailAccountService = container.getDIContainer().get<IMailAccountService>("IMailAccountService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(mailAccountService).not.undefined;
    });

    describe('Create a valid request to retrieve a mailAccount.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildMailAccountResponse(12345));
        });

        it('should return a mailAccount.', async () => {
            const mailAccount: MailAccount = await mailAccountService.getMailAccount('', 12345)
            expect(mailAccount).not.undefined;
            expect(mailAccount.ID).equal(12345);
        });
    });

    describe('Get multiple mailAccounts', () => {
        describe('Create a valid request to retrieve all mailAccounts.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildMailAccountsResponse(4));
            });

            it('should return a list of mailAccounts.', async () => {
                const mailAccount: MailAccount[] = await mailAccountService.getMailAccounts('');
                expect(mailAccount).not.undefined;
                expect(mailAccount).an('array');
                expect(mailAccount).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 mailAccounts', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildMailAccountsResponse(3));
            });

            it('should return a limited list of 3 mailAccounts.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', 3);
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts).not.empty;
                expect(mailAccounts.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of mailAccounts.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildMailAccountsResponse(2));
            });

            it('should return a sorted list of mailAccounts.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', null, SortOrder.DOWN);
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of mailAccounts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildMailAccountsResponse(3));
            });

            it('should return a list of mailAccounts filtered by changed after.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', null, null, "20170815");
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of mailAccounts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildMailAccountsResponse(6));
            });

            it('should return a limited list of mailAccounts filtered by changed after.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', 6, null, "20170815");
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts.length).equal(6);
                expect(mailAccounts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of mailAccounts', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildMailAccountsResponse(6));
            });

            it('should return a limited, sorted list of mailAccounts.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', 6, SortOrder.UP);
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts.length).equal(6);
                expect(mailAccounts).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of mailAccounts witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildMailAccountsResponse(4));
            });

            it('should return a sorted list of mailAccounts filtered by changed after.', async () => {
                const mailAccounts: MailAccount[] = await mailAccountService.getMailAccounts('', null, SortOrder.UP, "20170815");
                expect(mailAccounts).not.undefined;
                expect(mailAccounts).an('array');
                expect(mailAccounts).not.empty;
            });
        });
    });

    describe('Create mailAccount', () => {
        describe('Create a valid request to create a new mailAccount.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateMailAccountRequest(new CreateMailAccount('login', 'password', 'host', 'type', 'dispatchingBy')))
                    .reply(200, buildCreateMailAccountResponse(123456));
            });

            it('should return a the id of the new mailAccount.', async () => {
                const userId = await mailAccountService.createMailAccount('', new CreateMailAccount('login', 'password', 'host', 'type', 'dispatchingBy'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateMailAccountRequest(new CreateMailAccount('login', 'password', 'host', 'type', 'dispatchingBy')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await mailAccountService.createMailAccount('', new CreateMailAccount('login', 'password', 'host', 'type', 'dispatchingBy'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update mailAccount', () => {
        describe('Create a valid request to update an existing mailAccount.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateMailAccountRequest(new UpdateMailAccount('mailAccount', 'text')))
                    .reply(200, buildUpdateMailAccountResponse(123456));
            });

            it('should return the id of the mailAccount.', async () => {
                const userId = await mailAccountService.updateMailAccount('', 123456, new UpdateMailAccount('mailAccount', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing mailAccount.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateMailAccountRequest(new UpdateMailAccount('mailAccount', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await mailAccountService.updateMailAccount('', 123456, new UpdateMailAccount('mailAccount', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete mailAccount', () => {

        describe('Create a valid request to delete a mailAccount', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await mailAccountService.deleteMailAccount('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a mailAccount.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await mailAccountService.deleteMailAccount('', 123456)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });

    });

});

function buildMailAccountResponse(id: number): MailAccountResponse {
    const response = new MailAccountResponse();
    response.MailAccount = new MailAccount();
    response.MailAccount.ID = id;
    return response;
}

function buildMailAccountsResponse(mailAccountCount: number): MailAccountsResponse {
    const response = new MailAccountsResponse();
    for (let i = 0; i < mailAccountCount; i++) {
        response.MailAccount.push(new MailAccount());
    }
    return response;
}

function buildCreateMailAccountResponse(id: number): CreateMailAccountResponse {
    const response = new CreateMailAccountResponse();
    response.MailAccountID = id;
    return response;
}

function buildUpdateMailAccountResponse(id: number): UpdateMailAccountResponse {
    const response = new UpdateMailAccountResponse();
    response.MailAccountID = id;
    return response;
}