/* tslint:disable*/
import {
    ClientRegistrationsResponse,
    CreateClientRegistration,
    CreateClientRegistrationRequest,
    CreateClientRegistrationResponse,
    HttpError,
} from '@kix/core/dist/api';
import { ClientRegistration, SortOrder } from '@kix/core/dist/model';
import { IClientRegistrationService, IConfigurationService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../src/Container';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/clientregistration";

describe('ClientRegistration Service', () => {
    let nockScope;
    let clientRegistrationService: IClientRegistrationService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        clientRegistrationService = container.getDIContainer().get<IClientRegistrationService>("IClientRegistrationService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(clientRegistrationService).not.undefined;
    });

    describe('Get multiple clientRegistrations', () => {
        describe('Create a valid request to retrieve all clientRegistrations.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildClientRegistrationsResponse(4));
            });

            it('should return a list of clientRegistrations.', async () => {
                const clientRegistration: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('');
                expect(clientRegistration).not.undefined;
                expect(clientRegistration).an('array');
                expect(clientRegistration).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 clientRegistrations', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildClientRegistrationsResponse(3));
            });

            it('should return a limited list of 3 clientRegistrations.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('', 3);
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations).not.empty;
                expect(clientRegistrations.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of clientRegistrations.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildClientRegistrationsResponse(2));
            });

            it('should return a sorted list of clientRegistrations.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('', null, SortOrder.DOWN);
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of clientRegistrations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildClientRegistrationsResponse(3));
            });

            it('should return a list of clientRegistrations filtered by changed after.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('', null, null, "20170815");
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of clientRegistrations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildClientRegistrationsResponse(6));
            });

            it('should return a limited list of clientRegistrations filtered by changed after.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('', 6, null, "20170815");
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations.length).equal(6);
                expect(clientRegistrations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of clientRegistrations', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildClientRegistrationsResponse(6));
            });

            it('should return a limited, sorted list of clientRegistrations.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations('', 6, SortOrder.UP);
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations.length).equal(6);
                expect(clientRegistrations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of clientRegistrations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildClientRegistrationsResponse(4));
            });

            it('should return a sorted list of clientRegistrations filtered by changed after.', async () => {
                const clientRegistrations: ClientRegistration[] = await clientRegistrationService.getClientRegistrations(
                    '', null, SortOrder.UP, "20170815"
                );
                expect(clientRegistrations).not.undefined;
                expect(clientRegistrations).an('array');
                expect(clientRegistrations).not.empty;
            });
        });
    });

    describe('Create clientRegistration', () => {
        describe('Create a valid request to create a new clientRegistration.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateClientRegistrationRequest(
                        new CreateClientRegistration('clientRegistration', 'clientRegistration'))
                    ).reply(200, buildCreateClientRegistrationResponse("123456"));
            });

            it('should return a the id of the new clientRegistration.', async () => {
                const clientId = await clientRegistrationService.createClientRegistration(
                    '', new CreateClientRegistration('clientRegistration', 'clientRegistration')
                );
                expect(clientId).equal("123456");
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateClientRegistrationRequest(
                        new CreateClientRegistration('clientRegistration', 'clientRegistration'))
                    ).reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const clientId = await clientRegistrationService.createClientRegistration(
                    '', new CreateClientRegistration('clientRegistration', 'clientRegistration')
                ).then((result) => {
                    expect(true).false;
                }).catch((error: HttpError) => {
                    expect(error).instanceof(HttpError);
                    expect(error.status).equals(400);
                });
            });

        });
    });

    describe('Delete clientRegistration', () => {

        describe('Create a valid request to delete a clientRegistration', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await clientRegistrationService.deleteClientRegistration('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a clientRegistration.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const clientId = await clientRegistrationService.deleteClientRegistration('', 123456)
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

function buildClientRegistrationsResponse(clientRegistrationCount: number): ClientRegistrationsResponse {
    const response = new ClientRegistrationsResponse();
    for (let i = 0; i < clientRegistrationCount; i++) {
        response.ClientRegistration.push(new ClientRegistration());
    }
    return response;
}

function buildCreateClientRegistrationResponse(id: string): CreateClientRegistrationResponse {
    const response = new CreateClientRegistrationResponse();
    response.ClientID = id;
    return response;
}
