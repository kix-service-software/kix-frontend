/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    StandardAttachmentResponse,
    StandardAttachmentsResponse,
    CreateStandardAttachment,
    CreateStandardAttachmentRequest,
    CreateStandardAttachmentResponse,
    UpdateStandardAttachment,
    UpdateStandardAttachmentRequest,
    UpdateStandardAttachmentResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { StandardAttachment } from '@kix/core/dist/model';
import { IStandardAttachmentService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/standardattachments";

describe('StandardAttachment Service', () => {
    let nockScope;
    let standardAttachmentService: IStandardAttachmentService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        standardAttachmentService = container.getDIContainer().get<IStandardAttachmentService>("IStandardAttachmentService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(standardAttachmentService).not.undefined;
    });

    describe('Create a valid request to retrieve a standardAttachment.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildStandardAttachmentResponse(12345));
        });

        it('should return a standardAttachment.', async () => {
            const standardAttachment: StandardAttachment = await standardAttachmentService.getStandardAttachment('', 12345)
            expect(standardAttachment).not.undefined;
            expect(standardAttachment.ID).equal(12345);
        });
    });

    describe('Get multiple standardAttachments', () => {
        describe('Create a valid request to retrieve all standardAttachments.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildStandardAttachmentsResponse(4));
            });

            it('should return a list of standardAttachments.', async () => {
                const standardAttachment: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('');
                expect(standardAttachment).not.undefined;
                expect(standardAttachment).an('array');
                expect(standardAttachment).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 standardAttachments', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildStandardAttachmentsResponse(3));
            });

            it('should return a limited list of 3 standardAttachments.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', 3);
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments).not.empty;
                expect(standardAttachments.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of standardAttachments.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildStandardAttachmentsResponse(2));
            });

            it('should return a sorted list of standardAttachments.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', null, SortOrder.DOWN);
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of standardAttachments which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildStandardAttachmentsResponse(3));
            });

            it('should return a list of standardAttachments filtered by changed after.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', null, null, "20170815");
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of standardAttachments which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildStandardAttachmentsResponse(6));
            });

            it('should return a limited list of standardAttachments filtered by changed after.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', 6, null, "20170815");
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments.length).equal(6);
                expect(standardAttachments).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of standardAttachments', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildStandardAttachmentsResponse(6));
            });

            it('should return a limited, sorted list of standardAttachments.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', 6, SortOrder.UP);
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments.length).equal(6);
                expect(standardAttachments).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of standardAttachments which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildStandardAttachmentsResponse(4));
            });

            it('should return a sorted list of standardAttachments filtered by changed after.', async () => {
                const standardAttachments: StandardAttachment[] = await standardAttachmentService.getStandardAttachments('', null, SortOrder.UP, "20170815");
                expect(standardAttachments).not.undefined;
                expect(standardAttachments).an('array');
                expect(standardAttachments).not.empty;
            });
        });
    });

    describe('Create standardAttachment', () => {
        describe('Create a valid request to create a new standardAttachment.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateStandardAttachmentRequest(
                        new CreateStandardAttachment('standardAttachment', 'standardAttachment', 'standardAttachment', 'standardAttachment'))
                    ).reply(200, buildCreateStandardAttachmentResponse(123456));
            });

            it('should return a the id of the new standardAttachment.', async () => {
                const userId = await standardAttachmentService.createStandardAttachment(
                    '', new CreateStandardAttachment('standardAttachment', 'standardAttachment', 'standardAttachment', 'standardAttachment')
                );
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateStandardAttachmentRequest(
                        new CreateStandardAttachment('standardAttachment', 'standardAttachment', 'standardAttachment', 'standardAttachment'))
                    ).reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await standardAttachmentService.createStandardAttachment(
                    '', new CreateStandardAttachment('standardAttachment', 'standardAttachment', 'standardAttachment', 'standardAttachment')
                ).then((result) => {
                    expect(true).false;
                }).catch((error: HttpError) => {
                    expect(error).instanceof(HttpError);
                    expect(error.status).equals(400);
                });
            });

        });
    });

    describe('Update standardAttachment', () => {
        describe('Create a valid request to update an existing standardAttachment.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateStandardAttachmentRequest(new UpdateStandardAttachment('standardAttachment', 'text')))
                    .reply(200, buildUpdateStandardAttachmentResponse(123456));
            });

            it('should return the id of the standardAttachment.', async () => {
                const userId = await standardAttachmentService.updateStandardAttachment('', 123456, new UpdateStandardAttachment('standardAttachment', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing standardAttachment.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateStandardAttachmentRequest(new UpdateStandardAttachment('standardAttachment', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await standardAttachmentService.updateStandardAttachment('', 123456, new UpdateStandardAttachment('standardAttachment', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete standardAttachment', () => {

        describe('Create a valid request to delete a standardAttachment', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await standardAttachmentService.deleteStandardAttachment('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a standardAttachment.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await standardAttachmentService.deleteStandardAttachment('', 123456)
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

function buildStandardAttachmentResponse(id: number): StandardAttachmentResponse {
    const response = new StandardAttachmentResponse();
    response.StandardAttachment = new StandardAttachment();
    response.StandardAttachment.ID = id;
    return response;
}

function buildStandardAttachmentsResponse(standardAttachmentCount: number): StandardAttachmentsResponse {
    const response = new StandardAttachmentsResponse();
    for (let i = 0; i < standardAttachmentCount; i++) {
        response.StandardAttachment.push(new StandardAttachment());
    }
    return response;
}

function buildCreateStandardAttachmentResponse(id: number): CreateStandardAttachmentResponse {
    const response = new CreateStandardAttachmentResponse();
    response.StandardAttachmentID = id;
    return response;
}

function buildUpdateStandardAttachmentResponse(id: number): UpdateStandardAttachmentResponse {
    const response = new UpdateStandardAttachmentResponse();
    response.StandardAttachmentID = id;
    return response;
}