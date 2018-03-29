/* tslint:disable*/
import { ServiceContainer } from '@kix/core/dist/common';

import { HttpError, ArticleTypeResponse, ArticleTypesResponse } from '@kix/core/dist/api';
import { ITicketService, IConfigurationService } from '@kix/core/dist/services';
import { ArticleType, SortOrder } from '@kix/core/dist/model';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = "/articletypes";

describe('ArticleType Service', () => {
    let nockScope;
    let ticketService: ITicketService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        require('../../../TestSetup');
        const nock = require('nock');
        ticketService = ServiceContainer.getInstance().getClass<ITicketService>("ITicketService");
        configurationService = ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(ticketService).not.undefined;
    });

    describe('Get multiple article types', () => {
        describe('Create a valid request to retrieve all article types.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildArticleTypesResponse(4));
            });

            it('should return a list of article types.', async () => {
                const articleTypes: ArticleType[] = await ticketService.getArticleTypes('');
                expect(articleTypes).not.undefined;
                expect(articleTypes).an('array');
                expect(articleTypes).not.empty;
            });

        });
    });
});

function buildArticleTypesResponse(articleTypeCount: number): ArticleTypesResponse {
    const response = new ArticleTypesResponse();
    for (let i = 0; i < articleTypeCount; i++) {
        response.ArticleType.push(new ArticleType());
    }
    return response;
}