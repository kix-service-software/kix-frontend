import {
    KIXObjectType, Error, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class ServiceService extends KIXObjectService {

    private static INSTANCE: ServiceService;

    public static getInstance(): ServiceService {
        if (!ServiceService.INSTANCE) {
            ServiceService.INSTANCE = new ServiceService();
        }
        return ServiceService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = "services";

    public objectType: KIXObjectType = KIXObjectType.SERVICE;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SERVICE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.SERVICE:
                objects = await super.load(
                    token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'Service'
                );
                break;
            default:
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
