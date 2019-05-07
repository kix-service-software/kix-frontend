import {
    KIXObjectType, Error, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, ValidObject, ValidObjectFactory
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class ValidObjectService extends KIXObjectService {

    private static INSTANCE: ValidObjectService;

    public static getInstance(): ValidObjectService {
        if (!ValidObjectService.INSTANCE) {
            ValidObjectService.INSTANCE = new ValidObjectService();
        }
        return ValidObjectService.INSTANCE;
    }

    private constructor() {
        super([new ValidObjectFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = "valid";

    public objectType: KIXObjectType = KIXObjectType.VALID_OBJECT;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VALID_OBJECT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.VALID_OBJECT) {
            objects = await super.load<ValidObject>(
                token, KIXObjectType.VALID_OBJECT, this.RESOURCE_URI, loadingOptions, objectIds, 'Valid'
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
