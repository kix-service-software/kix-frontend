import { ObjectService } from './ObjectService';
import { IGeneralCatalogService } from '@kix/core/dist/services';
import { GeneralCatalogItem } from '@kix/core/dist/model';
import {
    CreateGeneralCatalogItem,
    CreateGeneralCatalogItemResponse,
    CreateGeneralCatalogItemRequest,
    GeneralCatalogItemsResponse,
    GeneralCatalogItemResponse,
    UpdateGeneralCatalogItem,
    UpdateGeneralCatalogItemResponse,
    UpdateGeneralCatalogItemRequest,
    GeneralCatalogClassesResponse,
    UpdateGeneralCatalogClassRequest,
    UpdateGeneralCatalogClassResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class GeneralCatalogService extends ObjectService<GeneralCatalogItem> implements IGeneralCatalogService {

    protected RESOURCE_URI: string = 'generalcatalog';

    public async getItems(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<GeneralCatalogItem[]> {

        const response = await this.getObjects<GeneralCatalogItemsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.GeneralCatalogItem;
    }

    public async getItem(token: string, catalogItemId: number, query?: any): Promise<GeneralCatalogItem> {
        const response = await this.getObject<GeneralCatalogItemResponse>(
            token, catalogItemId
        );

        return response.GeneralCatalogItem;
    }

    public async createItem(token: string, createGeneralCatalog: CreateGeneralCatalogItem): Promise<number> {
        const response = await this.createObject<CreateGeneralCatalogItemResponse, CreateGeneralCatalogItemRequest>(
            token, this.RESOURCE_URI, new CreateGeneralCatalogItemRequest(createGeneralCatalog)
        );

        return response.GeneralCatalogItemID;
    }

    public async updateItem(
        token: string, catalogItemId: number, updateGeneralCatalog: UpdateGeneralCatalogItem
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, catalogItemId);
        const response = await this.updateObject<UpdateGeneralCatalogItemResponse, UpdateGeneralCatalogItemRequest>(
            token, uri, new UpdateGeneralCatalogItemRequest(updateGeneralCatalog)
        );

        return response.GeneralCatalogItemID;
    }

    public async deleteItem(token: string, catalogItemId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, catalogItemId);
        await this.deleteObject<void>(token, uri);
    }

    public async getClasses(token: string): Promise<string[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'classes');
        const response = await this.getObjectByUri<GeneralCatalogClassesResponse>(token, uri);

        return response.GeneralCatalogClass;
    }

    public async updateClass(token: string, oldClassName: string, newClassName: string): Promise<string> {
        const uri = this.buildUri(this.RESOURCE_URI, 'classes', oldClassName);
        const response = await this.updateObject<UpdateGeneralCatalogClassResponse, UpdateGeneralCatalogClassRequest>(
            token, uri, new UpdateGeneralCatalogClassRequest(newClassName)
        );

        return response.GeneralCatalogClass;
    }

}
