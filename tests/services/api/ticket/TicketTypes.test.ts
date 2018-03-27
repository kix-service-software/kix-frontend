/* tslint:disable*/
import { TicketTypesResponse } from '@kix/core/dist/api';
import { TicketType } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../../src/Container';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/tickettypes";

describe('Ticket Type Service', () => {
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

    describe('Get multiple ticket types', () => {
        describe('Create a valid request to retrieve all ticket types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTicketTypesResponse(4));
            });

            it('should return a list of ticket types.', async () => {
                const ticketTypes: TicketType[] = await ticketService.getTicketTypes('');
                expect(ticketTypes).not.undefined;
                expect(ticketTypes).an('array');
                expect(ticketTypes).not.empty;
            });

        });
    });
});

function buildTicketTypesResponse(ticketTypeCount: number): TicketTypesResponse {
    const response = new TicketTypesResponse();
    for (let i = 0; i < ticketTypeCount; i++) {
        response.TicketType.push(new TicketType());
    }
    return response;
}