/* tslint:disable*/
import { container } from './../../src/Container';

import {
    IValidService,
    IConfigurationService,
    HttpError,
    Valid,
    ValidResponse,
    ValidsResponse,
    SortOrder
} from '@kix/core';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/valid";

describe('Valid Service', () => {
    let nockScope;
    let validService: IValidService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        validService = container.getDIContainer().get<IValidService>("IValidService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(validService).not.undefined;
    });

    describe('Create a valid request to retrieve a valid object.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildValidResponse(12345));
        });

        it('should return a ticket state object.', async () => {
            const valid: Valid = await validService.getValid('', 12345)
            expect(valid).not.undefined;
            expect(valid.ID).equal(12345);
        });
    });

    describe('Get multiple valid objects', () => {
        describe('Create a valid request to retrieve all valid objects.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildValidsResponse(4));
            });

            it('should return a list of valid objects.', async () => {
                const valids: Valid[] = await validService.getValids('');
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 valid objects', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildValidsResponse(3));
            });

            it('should return a limited list of 3 valid objects.', async () => {
                const valids: Valid[] = await validService.getValids('', 3);
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids).not.empty;
                expect(valids.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of valid objects.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildValidsResponse(2));
            });

            it('should return a sorted list of valid objects.', async () => {
                const valids: Valid[] = await validService.getValids('', null, SortOrder.DOWN);
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of valid objects witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildValidsResponse(3));
            });

            it('should return a list of valid objects filtered by changed after.', async () => {
                const valids: Valid[] = await validService.getValids('', null, null, "20170815");
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of valid objects witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildValidsResponse(6));
            });

            it('should return a limited list of valid objects filtered by changed after.', async () => {
                const valids: Valid[] = await validService.getValids('', 6, null, "20170815");
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids.length).equal(6);
                expect(valids).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of valid objects', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildValidsResponse(6));
            });

            it('should return a limited, sorted list of valid objects.', async () => {
                const valids: Valid[] = await validService.getValids('', 6, SortOrder.UP);
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids.length).equal(6);
                expect(valids).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of valid objects witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildValidsResponse(4));
            });

            it('should return a sorted list of valid objects filtered by changed after.', async () => {
                const valids: Valid[] = await validService.getValids('', null, SortOrder.UP, "20170815");
                expect(valids).not.undefined;
                expect(valids).an('array');
                expect(valids).not.empty;
            });
        });
    });
});

function buildValidResponse(id: number): ValidResponse {
    const response = new ValidResponse();
    response.Valid = new Valid();
    response.Valid.ID = id;
    return response;
}

function buildValidsResponse(ticketStateCount: number): ValidsResponse {
    const response = new ValidsResponse();
    for (let i = 0; i < ticketStateCount; i++) {
        response.Valid.push(new Valid());
    }
    return response;
}