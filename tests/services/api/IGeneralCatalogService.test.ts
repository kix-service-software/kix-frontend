/* tslint:disable*/
import { GeneralCatalogItemsResponse } from '@kix/core/dist/api';
import { GeneralCatalogItem } from '@kix/core/dist/model';
import { IConfigurationService, IGeneralCatalogService } from '@kix/core/dist/services';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { container } from '../../../src/Container';

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