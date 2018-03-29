/* tslint:disable*/
import { QueuesResponse } from '@kix/core/dist/api';
import { Queue } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/queues";

describe('Queue Service', () => {
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

    describe('Get multiple queues', () => {
        describe('Create a valid request to retrieve all queues.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildQueuesResponse(4));
            });

            it('should return a list of queues.', async () => {
                const queue: Queue[] = await ticketService.getQueues('');
                expect(queue).not.undefined;
                expect(queue).an('array');
                expect(queue).not.empty;
            });

        });
    });

});

function buildQueuesResponse(groupCount: number): QueuesResponse {
    const response = new QueuesResponse();
    for (let i = 0; i < groupCount; i++) {
        response.Queue.push(new Queue());
    }
    return response;
}