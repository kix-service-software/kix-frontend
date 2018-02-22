/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    SalutationResponse,
    SalutationsResponse,
    CreateSalutation,
    CreateSalutationRequest,
    CreateSalutationResponse,
    UpdateSalutation,
    UpdateSalutationRequest,
    UpdateSalutationResponse
} from '@kix/core/dist/api';

import { Salutation, SortOrder } from '@kix/core/dist/model';
import { ISalutationService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/salutations";

describe('Salutation Service', () => {
    let nockScope;
    let salutationService: ISalutationService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        salutationService = container.getDIContainer().get<ISalutationService>("ISalutationService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(salutationService).not.undefined;
    });

    describe('Create a valid request to retrieve a salutation.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildSalutationResponse(12345));
        });

        it('should return a salutation.', async () => {
            const salutation: Salutation = await salutationService.getSalutation('', 12345)
            expect(salutation).not.undefined;
            expect(salutation.ID).equal(12345);
        });
    });

    describe('Get multiple salutations', () => {
        describe('Create a valid request to retrieve all salutations.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildSalutationsResponse(4));
            });

            it('should return a list of salutations.', async () => {
                const salutation: Salutation[] = await salutationService.getSalutations('');
                expect(salutation).not.undefined;
                expect(salutation).an('array');
                expect(salutation).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 salutations', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildSalutationsResponse(3));
            });

            it('should return a limited list of 3 salutations.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', 3);
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations).not.empty;
                expect(salutations.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of salutations.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildSalutationsResponse(2));
            });

            it('should return a sorted list of salutations.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', null, SortOrder.DOWN);
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of salutations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildSalutationsResponse(3));
            });

            it('should return a list of salutations filtered by changed after.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', null, null, "20170815");
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of salutations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildSalutationsResponse(6));
            });

            it('should return a limited list of salutations filtered by changed after.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', 6, null, "20170815");
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations.length).equal(6);
                expect(salutations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of salutations', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildSalutationsResponse(6));
            });

            it('should return a limited, sorted list of salutations.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', 6, SortOrder.UP);
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations.length).equal(6);
                expect(salutations).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of salutations which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildSalutationsResponse(4));
            });

            it('should return a sorted list of salutations filtered by changed after.', async () => {
                const salutations: Salutation[] = await salutationService.getSalutations('', null, SortOrder.UP, "20170815");
                expect(salutations).not.undefined;
                expect(salutations).an('array');
                expect(salutations).not.empty;
            });
        });
    });

    describe('Create salutation', () => {
        describe('Create a valid request to create a new salutation.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSalutationRequest(new CreateSalutation('salutation', 'text')))
                    .reply(200, buildCreateSalutationResponse(123456));
            });

            it('should return a the id of the new salutation.', async () => {
                const userId = await salutationService.createSalutation('', new CreateSalutation('salutation', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSalutationRequest(new CreateSalutation('salutation', 'text')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await salutationService.createSalutation('', new CreateSalutation('salutation', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update salutation', () => {
        describe('Create a valid request to update an existing salutation.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateSalutationRequest(new UpdateSalutation('salutation', 'text')))
                    .reply(200, buildUpdateSalutationResponse(123456));
            });

            it('should return the id of the salutation.', async () => {
                const userId = await salutationService.updateSalutation('', 123456, new UpdateSalutation('salutation', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing salutation.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateSalutationRequest(new UpdateSalutation('salutation', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await salutationService.updateSalutation('', 123456, new UpdateSalutation('salutation', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete salutation', () => {

        describe('Create a valid request to delete a salutation', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await salutationService.deleteSalutation('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a salutation.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await salutationService.deleteSalutation('', 123456)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });

    });

});

function buildSalutationResponse(id: number): SalutationResponse {
    const response = new SalutationResponse();
    response.Salutation = new Salutation();
    response.Salutation.ID = id;
    return response;
}

function buildSalutationsResponse(salutationCount: number): SalutationsResponse {
    const response = new SalutationsResponse();
    for (let i = 0; i < salutationCount; i++) {
        response.Salutation.push(new Salutation());
    }
    return response;
}

function buildCreateSalutationResponse(id: number): CreateSalutationResponse {
    const response = new CreateSalutationResponse();
    response.SalutationID = id;
    return response;
}

function buildUpdateSalutationResponse(id: number): UpdateSalutationResponse {
    const response = new UpdateSalutationResponse();
    response.SalutationID = id;
    return response;
}