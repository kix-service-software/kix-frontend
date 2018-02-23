/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    TextModuleResponse,
    TextModulesResponse,
    CreateTextModule,
    CreateTextModuleRequest,
    CreateTextModuleResponse,
    UpdateTextModule,
    UpdateTextModuleRequest,
    UpdateTextModuleResponse
} from '@kix/core/dist/api';

import { TextModule, SortOrder } from '@kix/core/dist/model';
import { ITextModuleService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/textmodules";

describe('TextModule Service', () => {
    let nockScope;
    let textModuleService: ITextModuleService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        textModuleService = container.getDIContainer().get<ITextModuleService>("ITextModuleService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(textModuleService).not.undefined;
    });

    describe("Create a valid request to retrieve textmodule categories", () => {
        before(() => {
            nockScope
                .get(resourcePath + '/categories')
                .reply(200, { TextModuleCategory: [] });
        });

        it('should return a list of categories.', async () => {
            const textModule = await textModuleService.getTextModulesCategories('');
            expect(textModule).not.undefined;
            expect(textModule).an('array');
        });
    });

    describe('Create a valid request to retrieve a textModule.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildTextModuleResponse(12345));
        });

        it('should return a textModule.', async () => {
            const textModule: TextModule = await textModuleService.getTextModule('', 12345)
            expect(textModule).not.undefined;
            expect(textModule.ID).equal(12345);
        });
    });

    describe('Get multiple textModules', () => {
        describe('Create a valid request to retrieve all textModules.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildTextModulesResponse(4));
            });

            it('should return a list of textModules.', async () => {
                const textModule: TextModule[] = await textModuleService.getTextModules('');
                expect(textModule).not.undefined;
                expect(textModule).an('array');
                expect(textModule).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 textModules', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildTextModulesResponse(3));
            });

            it('should return a limited list of 3 textModules.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', 3);
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules).not.empty;
                expect(textModules.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of textModules.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildTextModulesResponse(2));
            });

            it('should return a sorted list of textModules.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', null, SortOrder.DOWN);
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of textModules which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildTextModulesResponse(3));
            });

            it('should return a list of textModules filtered by changed after.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', null, null, "20170815");
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of textModules which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildTextModulesResponse(6));
            });

            it('should return a limited list of textModules filtered by changed after.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', 6, null, "20170815");
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules.length).equal(6);
                expect(textModules).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of textModules', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildTextModulesResponse(6));
            });

            it('should return a limited, sorted list of textModules.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', 6, SortOrder.UP);
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules.length).equal(6);
                expect(textModules).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of textModules which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildTextModulesResponse(4));
            });

            it('should return a sorted list of textModules filtered by changed after.', async () => {
                const textModules: TextModule[] = await textModuleService.getTextModules('', null, SortOrder.UP, "20170815");
                expect(textModules).not.undefined;
                expect(textModules).an('array');
                expect(textModules).not.empty;
            });
        });
    });

    describe('Create textModule', () => {
        describe('Create a valid request to create a new textModule.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTextModuleRequest(new CreateTextModule('textModule', 'text')))
                    .reply(200, buildCreateTextModuleResponse(123456));
            });

            it('should return a the id of the new textModule.', async () => {
                const userId = await textModuleService.createTextModule('', new CreateTextModule('textModule', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateTextModuleRequest(new CreateTextModule('textModule', 'text')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await textModuleService.createTextModule('', new CreateTextModule('textModule', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update textModule', () => {
        describe('Create a valid request to update an existing textModule.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateTextModuleRequest(new UpdateTextModule('textModule', 'text')))
                    .reply(200, buildUpdateTextModuleResponse(123456));
            });

            it('should return the id of the textModule.', async () => {
                const userId = await textModuleService.updateTextModule('', 123456, new UpdateTextModule('textModule', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing textModule.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                        new UpdateTextModuleRequest(new UpdateTextModule('textModule', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await textModuleService.updateTextModule('', 123456, new UpdateTextModule('textModule', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete textModule', () => {

        describe('Create a valid request to delete a textModule', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await textModuleService.deleteTextModule('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a textModule.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await textModuleService.deleteTextModule('', 123456)
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

function buildTextModuleResponse(id: number): TextModuleResponse {
    const response = new TextModuleResponse();
    response.TextModule = new TextModule();
    response.TextModule.ID = id;
    return response;
}

function buildTextModulesResponse(textModuleCount: number): TextModulesResponse {
    const response = new TextModulesResponse();
    for (let i = 0; i < textModuleCount; i++) {
        response.TextModule.push(new TextModule());
    }
    return response;
}

function buildCreateTextModuleResponse(id: number): CreateTextModuleResponse {
    const response = new CreateTextModuleResponse();
    response.TextModuleID = id;
    return response;
}

function buildUpdateTextModuleResponse(id: number): UpdateTextModuleResponse {
    const response = new UpdateTextModuleResponse();
    response.TextModuleID = id;
    return response;
}