import { KIXObjectService } from './KIXObjectService';
import {
    GeneralCatalogItem, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
} from '../../../model';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { GeneralCatalogItemFactory } from '../../object-factories/GeneralCatalogItemFactory';

export class GeneralCatalogService extends KIXObjectService {

    protected RESOURCE_URI: string = this.buildUri('system', 'generalcatalog');

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

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
            const uri = this.buildUri('system', 'generalcatalog');
            objects = await super.load<GeneralCatalogItem>(
                token, KIXObjectType.GENERAL_CATALOG_ITEM, uri, loadingOptions, objectIds, 'GeneralCatalogItem'
            );
        }

        return objects;
    }

}
