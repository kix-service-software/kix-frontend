import { KIXObjectService } from './KIXObjectService';
import {
    GeneralCatalogItem, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, Error
} from '../../../model';
import { GeneralCatalogItemsResponse, GeneralCatalogItemResponse } from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class GeneralCatalogService extends KIXObjectService {

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'generalcatalog';

    public objectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;


    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        const query = this.prepareQuery(loadingOptions);
        let objects = [];

        if (objectType === KIXObjectType.GENERAL_CATALOG_ITEM) {
            if (objectIds && objectIds.length) {
                const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
                if (objectIds.length === 1) {
                    const response = await this.getObjectByUri<GeneralCatalogItemResponse>(token, uri);
                    objects = [...objects, response.GeneralCatalogItem];
                } else {
                    const response = await this.getObjectByUri<GeneralCatalogItemsResponse>(token, uri);
                    objects = [...objects, ...response.GeneralCatalogItem];
                }
            } else if (loadingOptions.filter) {
                await this.buildFilter(loadingOptions.filter, 'GeneralCatalogItem', token, query);
                const response = await this.getObjects<GeneralCatalogItemsResponse>(
                    token, loadingOptions.limit, null, null, query
                );
                objects = response.GeneralCatalogItem;
            }
            return objects;
        }
    }

    public async getItemsByClass(token: string, classId: string): Promise<GeneralCatalogItem[]> {
        const catalog = await this.getGeneralCatalog(token);
        return catalog.filter((gc) => gc.Class === classId);
    }

    private async getGeneralCatalog(token: string): Promise<GeneralCatalogItem[]> {
        const response = await this.getObjects<GeneralCatalogItemsResponse>(token);
        return response.GeneralCatalogItem;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
