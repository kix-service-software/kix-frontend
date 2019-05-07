import { KIXObjectService } from './KIXObjectService';
import {
    GeneralCatalogItem, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    Error, GeneralCatalogItemFactory
} from '../../../model';
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
        super([new GeneralCatalogItemFactory()]);
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
            objects = await super.load<GeneralCatalogItem>(
                token, KIXObjectType.GENERAL_CATALOG_ITEM, this.RESOURCE_URI,
                loadingOptions, objectIds, 'GeneralCatalogItem'
            );
        }

        return objects;
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
