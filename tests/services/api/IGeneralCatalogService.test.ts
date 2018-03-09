/* tslint:disable*/
import { container } from '../../../src/Container';

import {
    HttpError,
    GeneralCatalogItemResponse,
    GeneralCatalogItemsResponse,
    CreateGeneralCatalogItem,
    CreateGeneralCatalogItemRequest,
    CreateGeneralCatalogItemResponse,
    UpdateGeneralCatalogItem,
    UpdateGeneralCatalogItemRequest,
    UpdateGeneralCatalogItemResponse,
    UpdateGeneralCatalogClassRequest,
    UpdateGeneralCatalogClassResponse
} from '@kix/core/dist/api';

import { GeneralCatalogItem, SortOrder } from '@kix/core/dist/model';
import { IGeneralCatalogService, IConfigurationService } from '@kix/core/dist/services';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/generalcatalog';

describe('General Catalog Service', () => {
    let nockScope;
    let catalogItemService: IGeneralCatalogService;
    let configurationService: IConfigurationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();
        const nock = require('nock');
        catalogItemService = container.getDIContainer().get<IGeneralCatalogService>('IGeneralCatalogService');
        configurationService = container.getDIContainer().get<IConfigurationService>('IConfigurationService');
        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('service instance is registered in container.', () => {
        expect(catalogItemService).not.undefined;
    });


    describe('Get multiple catalogItems', () => {
        describe('Create a valid request to retrieve all catalogItems.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query((query) => true)
                    .reply(200, buildGeneralCatalogItemsResponse(4));
            });

            it('should return a list of catalogItems.', async () => {
                const catalogItem: GeneralCatalogItem[] = await catalogItemService.getItems('');
                expect(catalogItem).not.undefined;
                expect(catalogItem).an('array');
                expect(catalogItem).not.empty;
            });

        });

    });
});

function buildGeneralCatalogItemsResponse(catalogItemCount: number): GeneralCatalogItemsResponse {
    const response = new GeneralCatalogItemsResponse();
    for (let i = 0; i < catalogItemCount; i++) {
        response.GeneralCatalogItem.push(new GeneralCatalogItem());
    }
    return response;
}