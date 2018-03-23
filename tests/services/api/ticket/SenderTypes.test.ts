/* tslint:disable*/
import { SenderTypesResponse } from '@kix/core/dist/api';
import { SenderType } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../../src/Container';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/sendertypes";

describe('SenderType Service', () => {
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

    describe('Get multiple sender types', () => {
        describe('Create a valid request to retrieve all sender types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildSenderTypesResponse(4));
            });

            it('should return a list of sender types.', async () => {
                const SenderTypes: SenderType[] = await ticketService.getSenderTypes('');
                expect(SenderTypes).not.undefined;
                expect(SenderTypes).an('array');
                expect(SenderTypes).not.empty;
            });

        });
    });
});

function buildSenderTypesResponse(SenderTypeCount: number): SenderTypesResponse {
    const response = new SenderTypesResponse();
    for (let i = 0; i < SenderTypeCount; i++) {
        response.SenderType.push(new SenderType());
    }
    return response;
}