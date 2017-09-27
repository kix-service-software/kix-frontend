/* tslint:disable*/
import { container } from './../../src/Container';

import {
    ITicketPriorityService,
    IConfigurationService,
    HttpError,
    TicketPriority,
    TicketPriorityResponse,
    TicketPrioritiesResponse,
    CreateTicketPriority,
    CreateTicketPriorityRequest,
    CreateTicketPriorityResponse,
    UpdateTicketPriority,
    UpdateTicketPriorityRequest,
    UpdateTicketPriorityResponse,
    SortOrder
} from '@kix/core';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/priority";

describe('Ticket Priority Service', () => {
    let nockScope;
    let ticketPriorityService: ITicketPriorityService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketPriorityService = container.getDIContainer().get<ITicketPriorityService>("ITicketPriorityService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketPriorityService).not.undefined;
    });

    describe('Create a valid request to retrieve a ticket priority.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildTicketPriorityResponse(12345));
        });

        it('should return a ticket priority object.', async () => {
            const ticketPriority: TicketPriority = await ticketPriorityService.getTicketPriority('', 12345)
            expect(ticketPriority).not.undefined;
            expect(ticketPriority.ID).equal(12345);
        });
    });

    describe('Get multiple ticket prioritys', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a list of ticket prioritys.', async () => {
                const ticketTypes: TicketPriority[] = await ticketPriorityService.getTicketPriorities('');
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 ticket prioritys', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildTicketTypesResponse(3));
            });

            it('should return a limited list of 3 ticket prioritys.', async () => {
                const ticketTypes: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', 3);
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
                expect(ticketTypes.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket prioritys.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildTicketTypesResponse(2));
            });

            it('should return a sorted list of ticket prioritys.', async () => {
                const ticketTypes: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', null, SortOrder.DOWN);
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of ticket prioritys witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(3));
            });

            it('should return a list of ticket prioritys filtered by changed after.', async () => {
                const users: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', null, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of ticket prioritys witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(6));
            });

            it('should return a limited list of ticket prioritys filtered by changed after.', async () => {
                const users: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', 6, null, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of ticket prioritys', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildTicketTypesResponse(6));
            });

            it('should return a limited, sorted list of ticket prioritys.', async () => {
                const users: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', 6, SortOrder.UP);
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users.length).equal(6);
                expect(users).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket prioritys witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a sorted list of ticket prioritys filtered by changed after.', async () => {
                const users: TicketPriority[] = await ticketPriorityService.getTicketPriorities('', null, SortOrder.UP, "20170815");
                expect(users).not.undefined;
                expect(users).an('array');
                expect(users).not.empty;
            });
        });
    });

    describe('Create ticket priority', () => {
        describe('Create a valid request to create a new ticket priority.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketPriorityRequest(new CreateTicketPriority('ticket-priority', 1)))
                    .reply(200, buildCreateTicketTypeResponse(123456));
            });

            it('should return a the id of the new users.', async () => {
                const userId = await ticketPriorityService.createTicketPriority('', new CreateTicketPriority('ticket-priority', 1));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTicketPriorityRequest(new CreateTicketPriority('ticket-priority', 1)))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await ticketPriorityService.createTicketPriority('', new CreateTicketPriority('ticket-priority', 1))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update ticket priority', () => {
        describe('Create a valid request to update an existing ticket priority.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateTicketPriorityRequest(new UpdateTicketPriority('ticket-priority', 1)))
                    .reply(200, buildUpdateUserResponse(123456));
            });

            it('should return the id of the ticket priority.', async () => {
                const userId = await ticketPriorityService.updateTicketPriority('', 123456, new UpdateTicketPriority('ticket-priority', 1));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing ticket priority.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateTicketPriorityRequest(new UpdateTicketPriority('ticket-priority', 1)))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await ticketPriorityService.updateTicketPriority('', 123456, new UpdateTicketPriority('ticket-priority', 1))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete ticket priority', () => {

        describe('Create a valid request to delete a ticket priority', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await ticketPriorityService.deleteTicketPriority('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a ticket priority.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await ticketPriorityService.deleteTicketPriority('', 123456)
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

function buildTicketPriorityResponse(id: number): TicketPriorityResponse {
    const response = new TicketPriorityResponse();
    response.Priority = new TicketPriority();
    response.Priority.ID = id;
    return response;
}

function buildTicketTypesResponse(ticketTypeCount: number): TicketPrioritiesResponse {
    const response = new TicketPrioritiesResponse();
    for (let i = 0; i < ticketTypeCount; i++) {
        response.Priority.push(new TicketPriority());
    }
    return response;
}

function buildCreateTicketTypeResponse(id: number): CreateTicketPriorityResponse {
    const response = new CreateTicketPriorityResponse();
    response.PriorityID = id;
    return response;
}

function buildUpdateUserResponse(id: number): UpdateTicketPriorityResponse {
    const response = new UpdateTicketPriorityResponse();
    response.PriorityID = id;
    return response;
}