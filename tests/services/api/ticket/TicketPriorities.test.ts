/* tslint:disable*/
import { TicketPrioritiesResponse } from '@kix/core/dist/api';
import { TicketPriority } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/priorities";

describe('Ticket Priority Service', () => {
    let nockScope;
    let ticketService: ITicketService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../../TestSetup');
        const nock = require('nock');
        ticketService = ServiceContainer.getInstance().getClass<ITicketService>("ITicketService");
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketService).not.undefined;
    });

    describe('Get multiple ticket prioritys', () => {
        describe('Create a valid request to retrieve all users.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a list of ticket prioritys.', async () => {
                const ticketTypes: TicketPriority[] = await ticketService.getTicketPriorities('');
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });

        });
    });
});

function buildTicketTypesResponse(ticketTypeCount: number): TicketPrioritiesResponse {
    const response = new TicketPrioritiesResponse();
    for (let i = 0; i < ticketTypeCount; i++) {
        response.Priority.push(new TicketPriority());
    }
    return response;
}