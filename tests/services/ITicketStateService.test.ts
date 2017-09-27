/* tslint:disable*/
import { container } from './../../src/Container';

import {
    ITicketStateService,
    IConfigurationService,
    HttpError,
    TicketState,
    TicketStateResponse,
    TicketStatesResponse,
    SortOrder
} from '@kix/core';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/statetypes";

describe('Ticket State Service', () => {
    let nockScope;
    let ticketStateService: ITicketStateService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketStateService = container.getDIContainer().get<ITicketStateService>("ITicketStateService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketStateService).not.undefined;
    });

    describe('Create a valid request to retrieve a ticket state.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildTicketStateResponse(12345));
        });

        it('should return a ticket state object.', async () => {
            const ticketState: TicketState = await ticketStateService.getTicketState('', 12345)
            expect(ticketState).not.undefined;
            expect(ticketState.ID).equal(12345);
        });
    });

    describe('Get multiple ticket states', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketStatesResponse(4));
            });

            it('should return a list of ticket states.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('');
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 ticket states', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildTicketStatesResponse(3));
            });

            it('should return a limited list of 3 ticket states.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', 3);
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
                expect(ticketStates.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket states.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildTicketStatesResponse(2));
            });

            it('should return a sorted list of ticket states.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', null, SortOrder.DOWN);
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of ticket states witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildTicketStatesResponse(3));
            });

            it('should return a list of ticket states filtered by changed after.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', null, null, "20170815");
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of ticket states witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildTicketStatesResponse(6));
            });

            it('should return a limited list of ticket states filtered by changed after.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', 6, null, "20170815");
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates.length).equal(6);
                expect(ticketStates).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of ticket states', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildTicketStatesResponse(6));
            });

            it('should return a limited, sorted list of ticket states.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', 6, SortOrder.UP);
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates.length).equal(6);
                expect(ticketStates).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of ticket states witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildTicketStatesResponse(4));
            });

            it('should return a sorted list of ticket states filtered by changed after.', async () => {
                const ticketStates: TicketState[] = await ticketStateService.getTicketStates('', null, SortOrder.UP, "20170815");
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
            });
        });
    });
});

function buildTicketStateResponse(id: number): TicketStateResponse {
    const response = new TicketStateResponse();
    response.StateType = new TicketState();
    response.StateType.ID = id;
    return response;
}

function buildTicketStatesResponse(ticketStateCount: number): TicketStatesResponse {
    const response = new TicketStatesResponse();
    for (let i = 0; i < ticketStateCount; i++) {
        response.StateType.push(new TicketState());
    }
    return response;
}