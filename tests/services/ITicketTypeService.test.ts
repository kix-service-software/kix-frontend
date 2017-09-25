import { container } from './../../src/Container';

import { ITicketTypeService, IConfigurationService } from '@kix/core';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Service', () => {
    let nockScope;
    let ticketTypeService: ITicketTypeService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketTypeService = container.getDIContainer().get<ITicketTypeService>("IUserService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketTypeService).not.undefined;
    });
});