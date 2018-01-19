/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    SearchProfileResponse,
    SearchProfilesResponse,
    CreateSearchProfile,
    CreateSearchProfileRequest,
    CreateSearchProfileResponse,
    UpdateSearchProfile,
    UpdateSearchProfileRequest,
    UpdateSearchProfileResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { SearchProfile } from '@kix/core/dist/model';
import { ISearchProfileService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/searchprofiles";

describe('SearchProfile Service', () => {
    let nockScope;
    let searchProfileService: ISearchProfileService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        searchProfileService = container.getDIContainer().get<ISearchProfileService>("ISearchProfileService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(searchProfileService).not.undefined;
    });

    describe("Create a valid request to retrieve searchprofile categories", () => {
        before(() => {
            nockScope
                .get(resourcePath + '/categories')
                .reply(200, { SearchProfileCategory: [] });
        });

        it('should return a list of categories.', async () => {
            const searchProfile = await searchProfileService.getSearchProfilesCategories('');
            expect(searchProfile).not.undefined;
            expect(searchProfile).an('array');
        });
    });

    describe('Create a valid request to retrieve a searchProfile.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildSearchProfileResponse(12345));
        });

        it('should return a searchProfile.', async () => {
            const searchProfile: SearchProfile = await searchProfileService.getSearchProfile('', 12345)
            expect(searchProfile).not.undefined;
            expect(searchProfile.ID).equal(12345);
        });
    });

    describe('Get multiple searchProfiles', () => {
        describe('Create a valid request to retrieve all searchProfiles.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildSearchProfilesResponse(4));
            });

            it('should return a list of searchProfiles.', async () => {
                const searchProfile: SearchProfile[] = await searchProfileService.getSearchProfiles('');
                expect(searchProfile).not.undefined;
                expect(searchProfile).an('array');
                expect(searchProfile).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 searchProfiles', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildSearchProfilesResponse(3));
            });

            it('should return a limited list of 3 searchProfiles.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', 3);
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles).not.empty;
                expect(searchProfiles.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of searchProfiles.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildSearchProfilesResponse(2));
            });

            it('should return a sorted list of searchProfiles.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', null, SortOrder.DOWN);
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of searchProfiles which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildSearchProfilesResponse(3));
            });

            it('should return a list of searchProfiles filtered by changed after.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', null, null, "20170815");
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of searchProfiles which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildSearchProfilesResponse(6));
            });

            it('should return a limited list of searchProfiles filtered by changed after.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', 6, null, "20170815");
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles.length).equal(6);
                expect(searchProfiles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of searchProfiles', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildSearchProfilesResponse(6));
            });

            it('should return a limited, sorted list of searchProfiles.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', 6, SortOrder.UP);
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles.length).equal(6);
                expect(searchProfiles).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of searchProfiles which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildSearchProfilesResponse(4));
            });

            it('should return a sorted list of searchProfiles filtered by changed after.', async () => {
                const searchProfiles: SearchProfile[] = await searchProfileService.getSearchProfiles('', null, SortOrder.UP, "20170815");
                expect(searchProfiles).not.undefined;
                expect(searchProfiles).an('array');
                expect(searchProfiles).not.empty;
            });
        });
    });

    describe('Create searchProfile', () => {
        describe('Create a valid request to create a new searchProfile.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSearchProfileRequest(
                        new CreateSearchProfile('searchProfile', 'searchProfile', 'searchProfile', 'searchProfile'))
                    ).reply(200, buildCreateSearchProfileResponse(123456));
            });

            it('should return a the id of the new searchProfile.', async () => {
                const userId = await searchProfileService.createSearchProfile(
                    '', new CreateSearchProfile('searchProfile', 'searchProfile', 'searchProfile', 'searchProfile')
                );
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateSearchProfileRequest(
                        new CreateSearchProfile('searchProfile', 'searchProfile', 'searchProfile', 'searchProfile'))
                    ).reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await searchProfileService.createSearchProfile(
                    '', new CreateSearchProfile('searchProfile', 'searchProfile', 'searchProfile', 'searchProfile')
                ).then((result) => {
                    expect(true).false;
                }).catch((error: HttpError) => {
                    expect(error).instanceof(HttpError);
                    expect(error.status).equals(400);
                });
            });

        });
    });

    describe('Update searchProfile', () => {
        describe('Create a valid request to update an existing searchProfile.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateSearchProfileRequest(new UpdateSearchProfile('searchProfile', 'text')))
                    .reply(200, buildUpdateSearchProfileResponse(123456));
            });

            it('should return the id of the searchProfile.', async () => {
                const userId = await searchProfileService.updateSearchProfile('', 123456, new UpdateSearchProfile('searchProfile', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing searchProfile.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateSearchProfileRequest(new UpdateSearchProfile('searchProfile', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await searchProfileService.updateSearchProfile('', 123456, new UpdateSearchProfile('searchProfile', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete searchProfile', () => {

        describe('Create a valid request to delete a searchProfile', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await searchProfileService.deleteSearchProfile('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a searchProfile.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await searchProfileService.deleteSearchProfile('', 123456)
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

function buildSearchProfileResponse(id: number): SearchProfileResponse {
    const response = new SearchProfileResponse();
    response.SearchProfile = new SearchProfile();
    response.SearchProfile.ID = id;
    return response;
}

function buildSearchProfilesResponse(searchProfileCount: number): SearchProfilesResponse {
    const response = new SearchProfilesResponse();
    for (let i = 0; i < searchProfileCount; i++) {
        response.SearchProfile.push(new SearchProfile());
    }
    return response;
}

function buildCreateSearchProfileResponse(id: number): CreateSearchProfileResponse {
    const response = new CreateSearchProfileResponse();
    response.SearchProfileID = id;
    return response;
}

function buildUpdateSearchProfileResponse(id: number): UpdateSearchProfileResponse {
    const response = new UpdateSearchProfileResponse();
    response.SearchProfileID = id;
    return response;
}