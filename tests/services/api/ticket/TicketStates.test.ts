/* tslint:disable*/
import { container } from '../../../../src/Container';

import {
    HttpError,
    TicketStateResponse,
    TicketStatesResponse
} from '@kix/core/dist/api';

import { TicketState, SortOrder } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/ticketstates";

describe('Ticket State Service', () => {
    let nockScope;
    let ticketService: ITicketService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketService = container.getDIContainer().get<ITicketService>("ITicketService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketService).not.undefined;
    });

    describe('Ticket State Types', () => {
        describe('Create a valid request to retrieve ticket state types', () => {
            before(() => {
                nockScope
                    .get('/statetypes')
                    .reply(200, { StateType: [] });
            });

            it('should return a list of ticket state types.', async () => {
                const stateTypes = await ticketService.getTicketStateTypes('');
                expect(stateTypes).not.undefined;
                expect(stateTypes).an('array');
            });
        });
    });

    describe('Get multiple ticket states', () => {
        describe('Create a valid request to retrieve all ticket states.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketStatesResponse(4));
            });

            it('should return a list of ticket states.', async () => {
                const ticketStates: TicketState[] = await ticketService.getTicketStates('');
                expect(ticketStates).not.undefined;
                expect(ticketStates).an('array');
                expect(ticketStates).not.empty;
            });

        });
    });
});

function buildTicketStatesResponse(ticketStateCount: number): TicketStatesResponse {
    const response = new TicketStatesResponse();
    for (let i = 0; i < ticketStateCount; i++) {
        response.TicketState.push(new TicketState());
    }
    return response;
}