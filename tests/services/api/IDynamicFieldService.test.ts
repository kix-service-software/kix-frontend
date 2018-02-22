/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    DynamicFieldResponse,
    DynamicFieldsResponse,
    CreateDynamicField,
    CreateDynamicFieldRequest,
    CreateDynamicFieldResponse,
    UpdateDynamicField,
    UpdateDynamicFieldRequest,
    UpdateDynamicFieldResponse
} from '@kix/core/dist/api';

import { DynamicField, SortOrder } from '@kix/core/dist/model/';
import { IDynamicFieldService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/dynamicfields";

describe('DynamicField Service', () => {
    let nockScope;
    let dynamicFieldService: IDynamicFieldService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        dynamicFieldService = container.getDIContainer().get<IDynamicFieldService>("IDynamicFieldService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(dynamicFieldService).not.undefined;
    });

    describe('Create a valid request to retrieve a dynamicField.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildDynamicFieldResponse(12345));
        });

        it('should return a dynamicField.', async () => {
            const dynamicField: DynamicField = await dynamicFieldService.getDynamicField('', 12345)
            expect(dynamicField).not.undefined;
            expect(dynamicField.ID).equal(12345);
        });
    });

    describe('Get multiple dynamicFields', () => {
        describe('Create a valid request to retrieve all dynamicFields.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildDynamicFieldsResponse(4));
            });

            it('should return a list of dynamicFields.', async () => {
                const dynamicField: DynamicField[] = await dynamicFieldService.getDynamicFields('');
                expect(dynamicField).not.undefined;
                expect(dynamicField).an('array');
                expect(dynamicField).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 dynamicFields', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildDynamicFieldsResponse(3));
            });

            it('should return a limited list of 3 dynamicFields.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', 3);
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields).not.empty;
                expect(dynamicFields.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of dynamicFields.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildDynamicFieldsResponse(2));
            });

            it('should return a sorted list of dynamicFields.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', null, SortOrder.DOWN);
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of dynamicFields which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildDynamicFieldsResponse(3));
            });

            it('should return a list of dynamicFields filtered by changed after.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', null, null, "20170815");
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of dynamicFields which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildDynamicFieldsResponse(6));
            });

            it('should return a limited list of dynamicFields filtered by changed after.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', 6, null, "20170815");
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields.length).equal(6);
                expect(dynamicFields).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of dynamicFields', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildDynamicFieldsResponse(6));
            });

            it('should return a limited, sorted list of dynamicFields.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', 6, SortOrder.UP);
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields.length).equal(6);
                expect(dynamicFields).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of dynamicFields which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildDynamicFieldsResponse(4));
            });

            it('should return a sorted list of dynamicFields filtered by changed after.', async () => {
                const dynamicFields: DynamicField[] = await dynamicFieldService.getDynamicFields('', null, SortOrder.UP, "20170815");
                expect(dynamicFields).not.undefined;
                expect(dynamicFields).an('array');
                expect(dynamicFields).not.empty;
            });
        });
    });

    describe('Create dynamicField', () => {
        describe('Create a valid request to create a new dynamicField.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateDynamicFieldRequest(new CreateDynamicField('dynamicField', 'comment', 'DateTime', 'Ticket')))
                    .reply(200, buildCreateDynamicFieldResponse(123456));
            });

            it('should return a the id of the new dynamicField.', async () => {
                const dynamicFieldId = await dynamicFieldService.createDynamicField('', new CreateDynamicField('dynamicField', 'comment', 'DateTime', 'Ticket'));
                expect(dynamicFieldId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateDynamicFieldRequest(new CreateDynamicField('dynamicField', 'comment', 'DateTime', 'Ticket')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const dynamicFieldId = await dynamicFieldService.createDynamicField('', new CreateDynamicField('dynamicField', 'comment', 'DateTime', 'Ticket'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update dynamicField', () => {
        describe('Create a valid request to update an existing dynamicField.', () => {

            const updateDynamicField = new UpdateDynamicField('TestDynamicField');

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456', new UpdateDynamicFieldRequest(updateDynamicField))
                    .reply(200, buildUpdateDynamicFieldResponse(123456));
            });

            it('should return the id of the dynamicField.', async () => {
                const dynamicFieldId = await dynamicFieldService.updateDynamicField('', 123456, updateDynamicField);
                expect(dynamicFieldId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing dynamicField.', () => {

            const updateDynamicField = new UpdateDynamicField();

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456', new UpdateDynamicFieldRequest(updateDynamicField))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const dynamicFieldId = await dynamicFieldService.updateDynamicField('', 123456, updateDynamicField)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                    });
            });

        });
    });

    describe('Delete dynamicField', () => {

        describe('Create a valid request to delete a dynamicField', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await dynamicFieldService.deleteDynamicField('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a dynamicField.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await dynamicFieldService.deleteDynamicField('', 123456)
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                    });
            });

        });

    });

    describe('Create a valid request to retrieve a dynamicField types.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/types')
                .reply(200, { DynamicFieldType: [] });
        });

        it('should return a dynamicField.', async () => {
            const types = await dynamicFieldService.getDynamicFieldTypes('')
            expect(types).not.undefined;
            expect(types).an('array');
        });
    });

    describe('Create a valid request to retrieve dynamicField objects.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/objects')
                .reply(200, { DynamicFieldObject: [] });
        });

        it('should return a dynamicField.', async () => {
            const objects = await dynamicFieldService.getDynamicFieldObjects('')
            expect(objects).not.undefined;
            expect(objects).an('array');
        });
    });

    describe('Create a valid request to retrieve a dynamicField config.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/123456/config')
                .reply(200, { DynamicFieldConfig: {} });
        });

        it('should return a dynamicField config.', async () => {
            const config = await dynamicFieldService.getDynamicFieldConfig('', 123456)
            expect(config).not.undefined;
            expect(config).an('object');
        });
    });

});

function buildDynamicFieldResponse(id: number): DynamicFieldResponse {
    const response = new DynamicFieldResponse();
    response.DynamicField = new DynamicField();
    response.DynamicField.ID = id;
    return response;
}

function buildDynamicFieldsResponse(dynamicFieldCount: number): DynamicFieldsResponse {
    const response = new DynamicFieldsResponse();
    for (let i = 0; i < dynamicFieldCount; i++) {
        response.DynamicField.push(new DynamicField());
    }
    return response;
}

function buildCreateDynamicFieldResponse(id: number): CreateDynamicFieldResponse {
    const response = new CreateDynamicFieldResponse();
    response.DynamicFieldID = id;
    return response;
}

function buildUpdateDynamicFieldResponse(id: number): UpdateDynamicFieldResponse {
    const response = new UpdateDynamicFieldResponse();
    response.DynamicFieldID = id;
    return response;
}