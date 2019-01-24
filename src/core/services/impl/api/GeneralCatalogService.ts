import { KIXObjectService } from './KIXObjectService';
import {
    GeneralCatalogItem, KIXObjectType, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions,
    Error
} from '../../../model';
import { GeneralCatalogItemsResponse, GeneralCatalogItemResponse } from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';

export class GeneralCatalogService extends KIXObjectService {

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'generalcatalog';

    public kixObjectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    private catalogCache: GeneralCatalogItem[];

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;
        const response = await this.getObjects<GeneralCatalogItemsResponse>(token);
        this.catalogCache = response.GeneralCatalogItem.map((gc) => new GeneralCatalogItem(gc));
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        const query = this.prepareQuery(loadingOptions);
        let objects = [];

        if (objectType === KIXObjectType.GENERAL_CATALOG_ITEM) {
            if (objectIds) {
                const ids = [...objectIds];
                for (const objectId of ids) {
                    const index = this.catalogCache.findIndex((c) => c.ItemID === objectId);
                    if (index !== -1) {
                        objects.push(this.catalogCache[index]);

                        const idx = objectIds.findIndex((oid) => oid === objectId);
                        objectIds.splice(idx, 1);
                    }
                }

                if (objectIds.length) {
                    const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
                    const response = await this.getObjectByUri<GeneralCatalogItemsResponse>(token, uri);
                    objects = [...objects, ...response.GeneralCatalogItem];
                    response.GeneralCatalogItem.forEach((c) => this.catalogCache.push(c));
                    objects = await this.getGCItems(token, objectIds, loadingOptions);
                }
            } else if (loadingOptions.filter) {
                await this.buildFilter(loadingOptions.filter, 'GeneralCatalogItem', token, query);
                const response = await this.getObjects<GeneralCatalogItemsResponse>(
                    token, loadingOptions.limit, null, null, query
                );
                objects = response.GeneralCatalogItem;
            } else {
                objects = this.catalogCache;
            }
        }
        return objects;
    }

    private async getGCItems(
        token: string, gcItemIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<GeneralCatalogItem[]> {
        const query = this.prepareQuery(loadingOptions);

        let configItemClasses: GeneralCatalogItem[] = [];

        if (gcItemIds && gcItemIds.length) {
            gcItemIds = gcItemIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri(this.RESOURCE_URI, gcItemIds.join(','));
            const response = await this.getObjectByUri<GeneralCatalogItemsResponse | GeneralCatalogItemResponse>(
                token, uri, query
            );

            if (gcItemIds.length === 1) {
                configItemClasses = [(response as GeneralCatalogItemResponse).GeneralCatalogItem];
            } else {
                configItemClasses = (response as GeneralCatalogItemsResponse).GeneralCatalogItem;
            }

        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'GeneralCatalogItem', token, query);
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<GeneralCatalogItemsResponse>(token, uri, query);
            configItemClasses = response.GeneralCatalogItem;
        } else {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<GeneralCatalogItemsResponse>(token, uri, query);
            configItemClasses = response.GeneralCatalogItem;
        }

        return configItemClasses;
    }

    public async getItemsByClass(token: string, classId: string): Promise<GeneralCatalogItem[]> {
        return this.catalogCache.filter((gc) => gc.Class === classId);
    }

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
