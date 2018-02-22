/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    LockResponse
} from '@kix/core/dist/api';

import { Lock, SortOrder } from '@kix/core/dist/model';
import { ITicketLockService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/ticketlocks';

describe('Lock Service', () => {
    let nockScope;
    let ticketLockService: ITicketLockService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        ticketLockService = container.getDIContainer().get<ITicketLockService>('ITicketLockService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketLockService).not.undefined;
    });

    describe('Create a valid request to retrieve a lock.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/123456')
                .reply(200, buildLockeResponse(123456));
        });

        it('should return a lock.', async () => {
            const lock: Lock = await ticketLockService.getLock('', 123456)
            expect(lock).not.undefined;
            expect(lock.ID).equal(123456);
        });
    });

    describe('Create a valid request to retrieve a list of locks.', () => {

        before(() => {
            nockScope
                .get(resourcePath)
                .reply(200, { Lock: [] });
        });

        it('should return a list of locks.', async () => {
            const lock: Lock[] = await ticketLockService.getLocks('')
            expect(lock).not.undefined;
            expect(lock).an('array');
        });

    });

});

function buildLockeResponse(id: number): LockResponse {
    const response = new LockResponse();
    response.Lock = new Lock();
    response.Lock.ID = id;
    return response;
}
