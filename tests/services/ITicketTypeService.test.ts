/* tslint:disable*/
import { container } from './../../src/Container';

import {
    ITicketTypeService,
    IConfigurationService,
    HttpError,
    TicketType,
    TicketTypeResponse,
    TicketTypesResponse,
    CreateTicketTypeRequest,
    CreateTicketTypeResponse,
    UpdateTicketTypeRequest,
    UpdateTicketTypeResponse,
    SortOrder
} from '@kix/core';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/tickettypes";

describe('Ticket Type Service', () => {
    let nockScope;
    let ticketTypeService: ITicketTypeService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketTypeService = container.getDIContainer().get<ITicketTypeService>("ITicketTypeService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketTypeService).not.undefined;
    });

    describe('Create a valid request to retrieve a ticket type.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildTicketTypeResponse(12345));
        });

        it('should return a ticket type object.', async () => {
            const ticketType: TicketType = await ticketTypeService.getTicketType('', 12345)
            expect(ticketType).not.undefined;
            expect(ticketType.ID).equal(12345);
        });
    });

    describe('Get multiple ticket types', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a list of ticket types.', async () => {
                const ticketTypes: TicketType[] = await ticketTypeService.getTicketTypes('');
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 ticket types', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildTicketTypesResponse(3));
            });

            it('should return a limited list of 3 ticket types.', async () => {
                const ticketTypes: TicketType[] = await ticketTypeService.getTicketTypes('', 3);
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
                expect(ticketTypes.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildTicketTypesResponse(2));
            });

            it('should return a sorted list of ticket types.', async () => {
                const ticketTypes: TicketType[] = await ticketTypeService.getTicketTypes('', null, SortOrder.DOWN);
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of ticket types witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(3));
            });

            it('should return a list of ticket types filtered by changed after.', async () => {
                const users: TicketType[] = await ticketTypeService.getTicketTypes('', null, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of ticket types witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(6));
            });

            it('should return a limited list of ticket types filtered by changed after.', async () => {
                const users: TicketType[] = await ticketTypeService.getTicketTypes('', 6, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of ticket types', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildTicketTypesResponse(6));
            });

            it('should return a limited, sorted list of ticket types.', async () => {
                const users: TicketType[] = await ticketTypeService.getTicketTypes('', 6, SortOrder.UP);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket types witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a sorted list of ticket types filtered by changed after.', async () => {
                const users: TicketType[] = await ticketTypeService.getTicketTypes('', null, SortOrder.UP, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });
    });

    describe('Create Ticket Type', () => {
        describe('Create a valid request to create a new ticket type.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketTypeRequest('ticket-type', 1))
                    .reply(200, buildCreateTicketTypeResponse(123456));
            });

            it('should return a the id of the new users.', async () => {
                const userId = await ticketTypeService.createTicketType('', 'ticket-type', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketTypeRequest('ticket-type', 1))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await ticketTypeService.createTicketType('', 'ticket-type', 1)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update Ticket Type', () => {
        describe('Create a valid request to update an existing ticket type.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateTicketTypeRequest('ticket-type', 1))
                    .reply(200, buildUpdateUserResponse(123456));
            });

            it('should return the id of the ticket type.', async () => {
                const userId = await ticketTypeService.updateTicketType('', 123456, 'ticket-type', 1);
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing ticket type.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateTicketTypeRequest('ticket-type', 1))
                    .reply(400, {});
            });

            it('should return a the id of the ticket type.', async () => {
                const userId = await ticketTypeService.updateTicketType('', 123456, 'ticket-type', 1)
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

function buildTicketTypeResponse(id: number): TicketTypeResponse {
    const response = new TicketTypeResponse();
    response.TicketType = new TicketType();
    response.TicketType.ID = id;
    return response;
}

function buildTicketTypesResponse(ticketTypeCount: number): TicketTypesResponse {
    const response = new TicketTypesResponse();
    for (let i = 0; i < ticketTypeCount; i++) {
        response.TicketType.push(new TicketType());
    }
    return response;
}

function buildCreateTicketTypeResponse(id: number): CreateTicketTypeResponse {
    const response = new CreateTicketTypeResponse();
    response.TypeID = id;
    return response;
}

function buildUpdateUserResponse(id: number): UpdateTicketTypeResponse {
    const response = new UpdateTicketTypeResponse();
    response.TypeID = id;
    return response;
}