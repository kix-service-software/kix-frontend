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
    UpdateGeneralCatalogClassResponse,
    SortOrder
} from '@kix/core/dist/api';

import { GeneralCatalogItem } from '@kix/core/dist/model';
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

    describe('Create a valid request to retrieve a list of catalog classes.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/classes')
                .reply(200, {
                    GeneralCatalogClass: []
                });
        });

        it('should return a catalogItem.', async () => {
            const classes = await catalogItemService.getClasses('')
            expect(classes).not.undefined;
            expect(classes).an('array');
        });

    });

    describe('Create a valid request to update a catlog class name.', () => {

        before(() => {
            nockScope
                .patch(resourcePath + '/classes/123456',
                new UpdateGeneralCatalogClassRequest('654321'))
                .reply(200, { GeneralCatalogClass: '654321' });
        });

        it('should return the id of the catalogItem.', async () => {
            const className = await catalogItemService.updateClass('', '123456', '654321');
            expect(className).equal('654321');
        });

    });

    describe('Create a valid request to retrieve a catalogItem.', () => {

        before(() => {
            nockScope
                .get(resourcePath + '/12345')
                .reply(200, buildGeneralCatalogItemResponse(12345));
        });

        it('should return a catalogItem.', async () => {
            const catalogItem: GeneralCatalogItem = await catalogItemService.getItem('', 12345)
            expect(catalogItem).not.undefined;
            expect(catalogItem.ItemID).equal(12345);
        });
    });

    describe('Get multiple catalogItems', () => {
        describe('Create a valid request to retrieve all catalogItems.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .reply(200, buildGeneralCatalogItemsResponse(4));
            });

            it('should return a list of catalogItems.', async () => {
                const catalogItem: GeneralCatalogItem[] = await catalogItemService.getItems('');
                expect(catalogItem).not.undefined;
                expect(catalogItem).an('array');
                expect(catalogItem).not.empty;
            });

        });

        describe('Create a valid request to retrieve a list of 3 catalogItems', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 3 })
                    .reply(200, buildGeneralCatalogItemsResponse(3));
            });

            it('should return a limited list of 3 catalogItems.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', 3);
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems).not.empty;
                expect(catalogItems.length).equal(3);
            });
        });

        describe('Create a valid request to retrieve a sorted list of catalogItems.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Down' })
                    .reply(200, buildGeneralCatalogItemsResponse(2));
            });

            it('should return a sorted list of catalogItems.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', null, SortOrder.DOWN);
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems).not.empty;
            });
        });

        describe('Create a valid request to retrieve a list of catalogItems witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ changedafter: '20170815' })
                    .reply(200, buildGeneralCatalogItemsResponse(3));
            });

            it('should return a list of catalogItems filtered by changed after.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', null, null, '20170815');
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted list of catalogItems witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, changedafter: '20170815' })
                    .reply(200, buildGeneralCatalogItemsResponse(6));
            });

            it('should return a limited list of catalogItems filtered by changed after.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', 6, null, '20170815');
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems.length).equal(6);
                expect(catalogItems).not.empty;
            });
        });

        describe('Create a valid request to retrieve a limeted, sorted list of catalogItems', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ limit: 6, order: 'Up' })
                    .reply(200, buildGeneralCatalogItemsResponse(6));
            });

            it('should return a limited, sorted list of catalogItems.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', 6, SortOrder.UP);
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems.length).equal(6);
                expect(catalogItems).not.empty;
            });
        });

        describe('Create a valid request to retrieve a sorted list of catalogItems witch where changed after defined date.', () => {

            before(() => {
                nockScope
                    .get(resourcePath)
                    .query({ order: 'Up', changedafter: '20170815' })
                    .reply(200, buildGeneralCatalogItemsResponse(4));
            });

            it('should return a sorted list of catalogItems filtered by changed after.', async () => {
                const catalogItems: GeneralCatalogItem[] = await catalogItemService.getItems('', null, SortOrder.UP, '20170815');
                expect(catalogItems).not.undefined;
                expect(catalogItems).an('array');
                expect(catalogItems).not.empty;
            });
        });
    });

    describe('Create catalogItem', () => {
        describe('Create a valid request to create a new catalogItem.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateGeneralCatalogItemRequest(new CreateGeneralCatalogItem('catalogItem', 'text')))
                    .reply(200, buildCreateGeneralCatalogItemResponse(123456));
            });

            it('should return a the id of the new catalogItem.', async () => {
                const userId = await catalogItemService.createItem('', new CreateGeneralCatalogItem('catalogItem', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid create request.', () => {

            before(() => {
                nockScope
                    .post(resourcePath, new CreateGeneralCatalogItemRequest(new CreateGeneralCatalogItem('catalogItem', 'text')))
                    .reply(400, {});
            });

            it('should throw an error if request is invalid.', async () => {
                const userId = await catalogItemService.createItem('', new CreateGeneralCatalogItem('catalogItem', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Update catalogItem', () => {
        describe('Create a valid request to update an existing catalogItem.', () => {

            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateGeneralCatalogItemRequest(new UpdateGeneralCatalogItem('catalogItem', 'text')))
                    .reply(200, buildUpdateGeneralCatalogItemResponse(123456));
            });

            it('should return the id of the catalogItem.', async () => {
                const userId = await catalogItemService.updateItem('', 123456, new UpdateGeneralCatalogItem('catalogItem', 'text'));
                expect(userId).equal(123456);
            });

        });

        describe('Create a invalid request to update an existing catalogItem.', () => {
            before(() => {
                nockScope
                    .patch(resourcePath + '/123456',
                    new UpdateGeneralCatalogItemRequest(new UpdateGeneralCatalogItem('catalogItem', 'text')))
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await catalogItemService.updateItem('', 123456, new UpdateGeneralCatalogItem('catalogItem', 'text'))
                    .then((result) => {
                        expect(true).false;
                    }).catch((error: HttpError) => {
                        expect(error).instanceof(HttpError);
                        expect(error.status).equals(400);
                    });
            });

        });
    });

    describe('Delete catalogItem', () => {

        describe('Create a valid request to delete a catalogItem', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(200, {});
            });

            it('Should resolve without any error', async () => {
                await catalogItemService.deleteItem('', 123456).then(() => {
                    expect(true).true;
                }).catch((error) => {
                    expect(true).false;
                })
            });

        });

        describe('Create a invalid reqeust to delete a catalogItem.', () => {

            before(() => {
                nockScope
                    .delete(resourcePath + '/123456')
                    .reply(400, {});
            });

            it('should throw a error.', async () => {
                const userId = await catalogItemService.deleteItem('', 123456)
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

function buildGeneralCatalogItemResponse(id: number): GeneralCatalogItemResponse {
    const response = new GeneralCatalogItemResponse();
    response.GeneralCatalogItem = new GeneralCatalogItem();
    response.GeneralCatalogItem.ItemID = id;
    return response;
}

function buildGeneralCatalogItemsResponse(catalogItemCount: number): GeneralCatalogItemsResponse {
    const response = new GeneralCatalogItemsResponse();
    for (let i = 0; i < catalogItemCount; i++) {
        response.GeneralCatalogItem.push(new GeneralCatalogItem());
    }
    return response;
}

function buildCreateGeneralCatalogItemResponse(id: number): CreateGeneralCatalogItemResponse {
    const response = new CreateGeneralCatalogItemResponse();
    response.GeneralCatalogItemID = id;
    return response;
}

function buildUpdateGeneralCatalogItemResponse(id: number): UpdateGeneralCatalogItemResponse {
    const response = new UpdateGeneralCatalogItemResponse();
    response.GeneralCatalogItemID = id;
    return response;
}