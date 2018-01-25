/* tslint:disable*/
import { container } from '../../../src/Container';

import { HttpError, ArticleTypeResponse, ArticleTypesResponse } from '@kix/core/dist/api';
import { IArticleTypeService, IConfigurationService } from '@kix/core/dist/services';
import { ArticleType } from '@kix/core/dist/model';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/articletypes";

describe('ArticleType Service', () => {
    let nockScope;
    let articleTypeService: IArticleTypeService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        articleTypeService = container.getDIContainer().get<IArticleTypeService>("IArticleTypeService");
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(articleTypeService).not.undefined;
    });

    describe('Create a valid request to retrieve a article type.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildArticleTypeResponse(12345));
        });

        it('should return a article type.', async () => {
            const articleType: ArticleType = await articleTypeService.getArticleType('', 12345)
            expect(articleType).not.undefined;
            expect(articleType.ID).equal(12345);
        });
    });

    describe('Get multiple article types', () => {
        describe('Create a valid request to retrieve all article types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildArticleTypesResponse(4));
            });

            it('should return a list of article types.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('');
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 article types', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildArticleTypesResponse(3));
            });

            it('should return a limited list of 3 article types.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('', 3);
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes).not.empty;
                expect(articleTypes.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of article types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildArticleTypesResponse(2));
            });

            it('should return a sorted list of article types.', async () => {
                const articleType: ArticleType[] = await articleTypeService.getArticleTypes('', null, SortOrder.DOWN);
                expect(articleType).not.undefined;
                expect(articleType).an('array');
                expect(articleType).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of article types which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildArticleTypesResponse(3));
            });

            it('should return a list of article types filtered by changed after.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('', null, null, "20170815");
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited list of article types which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildArticleTypesResponse(6));
            });

            it('should return a limited list of article types filtered by changed after.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('', 6, null, "20170815");
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes.length).equal(6);
                expect(articleTypes).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limited, sorted list of article types', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildArticleTypesResponse(6));
            });

            it('should return a limited, sorted list of article types.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('', 6, SortOrder.UP);
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes.length).equal(6);
                expect(articleTypes).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of article types which where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildArticleTypesResponse(4));
            });

            it('should return a sorted list of article types filtered by changed after.', async () => {
                const articleTypes: ArticleType[] = await articleTypeService.getArticleTypes('', null, SortOrder.UP, "20170815");
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes).not.empty;
            });
        });
    });
});

function buildArticleTypeResponse(id: number): ArticleTypeResponse {
    const response = new ArticleTypeResponse();
    response.ArticleType = new ArticleType();
    response.ArticleType.ID = id;
    return response;
}

function buildArticleTypesResponse(articleTypeCount: number): ArticleTypesResponse {
    const response = new ArticleTypesResponse();
    for (let i = 0; i < articleTypeCount; i++) {
        response.ArticleType.push(new ArticleType());
    }
    return response;
}