/* tslint:disable*/
import { Lock } from '@kix/core/dist/model';
import { IConfigurationService, ITicketService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/ticketlocks';

describe('Lock Service', () => {
    let nockScope;
    let ticketService: ITicketService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../../TestSetup');
        const nock = require('nock');
        ticketService = ServiceContainer.getInstance().getClass<ITicketService>('ITicketService');
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketService).not.undefined;
    });

    describe('Create a valid request to retrieve a list of locks.', () => {

        before(() => {
            nockScope
                .get(resourcePath)
                .reply(200, { Lock: [] });
        });

        it('should return a list of locks.', async () => {
            const lock: Lock[] = await ticketService.getLocks('')
            expect(lock).not.undefined;
            expect(lock).an('array');
        });

    });

});
