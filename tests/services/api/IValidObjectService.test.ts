/* tslint:disable*/
import { ValidObjectResponse, ValidObjectsResponse } from '@kix/core/dist/api';
import { SortOrder, ValidObject } from '@kix/core/dist/model';
import { IConfigurationService, IValidObjectService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ServiceContainer } from '@kix/core/dist/common';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/valid";

describe('Valid Service', () => {
    let nockScope;
    let validService: IValidObjectService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../TestSetup');
        const nock = require('nock');
        validService = ServiceContainer.getInstance().getClass<IValidObjectService>("IValidObjectService");
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('Service instance is registered in container.', () => {
        expect(validService).not.undefined;
    });

    describe('Create a valid request to retrieve a ValidObject.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildValidResponse(12345));
        });

        it('should return a ValidObject object.', async () => {
            const validObject: ValidObject = await validService.getValidObject('', 12345)
            expect(validObject).not.undefined;
            expect(validObject.ID).equal(12345);
        });
    });

    describe('Get multiple ValidObjects', () => {
        describe('Create a valid request to retrieve all ValidObjects.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildValidsResponse(4));
            });

            it('should return a list of ValidObjects.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('');
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 ValidObjects', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildValidsResponse(3));
            });

            it('should return a limited list of 3 ValidObjects.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', 3);
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects).not.empty;
                expect(validObjects.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of ValidObjects.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildValidsResponse(2));
            });

            it('should return a sorted list of ValidObjects.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', null, SortOrder.DOWN);
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of ValidObjects which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildValidsResponse(3));
            });

            it('should return a list of ValidObjects filtered by changed after.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', null, null, "20170815");
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of ValidObjects which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildValidsResponse(6));
            });

            it('should return a limited list of ValidObjects filtered by changed after.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', 6, null, "20170815");
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects.length).equal(6);
                expect(validObjects).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of ValidObjects', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildValidsResponse(6));
            });

            it('should return a limited, sorted list of ValidObjects.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', 6, SortOrder.UP);
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects.length).equal(6);
                expect(validObjects).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of ValidObjects which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildValidsResponse(4));
            });

            it('should return a sorted list of ValidObjects filtered by changed after.', async () => {
                const validObjects: ValidObject[] = await validService.getValidObjects('', null, SortOrder.UP, "20170815");
                expect(validObjects).not.undefined;
                expect(validObjects).an('array');
                expect(validObjects).not.empty;
            });
        });
    });
});

function buildValidResponse(id: number): ValidObjectResponse {
    const response = new ValidObjectResponse();
    response.Valid = new ValidObject();
    response.Valid.ID = id;
    return response;
}

function buildValidsResponse(ticketStateCount: number): ValidObjectsResponse {
    const response = new ValidObjectsResponse();
    for (let i = 0; i < ticketStateCount; i++) {
        response.Valid.push(new ValidObject());
    }
    return response;
}