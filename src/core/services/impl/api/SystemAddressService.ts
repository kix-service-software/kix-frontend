import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, SystemAddress, SystemAddressFactory
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { CreateSystemAddresses } from '../../../api/system-addresses/CreateSystemAddresses';
import { CreateSystemAddressesResponse } from '../../../api/system-addresses/CreateSystemAddressesResponse';
import { CreateSystemAddressesRequest } from '../../../api/system-addresses/CreateSystemAddressesRequest';
import { LoggingService } from '../LoggingService';

export class SystemAddressService extends KIXObjectService {

    private static INSTANCE: SystemAddressService;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }
        return SystemAddressService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'systemaddresses';

    public objectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    private constructor() {
        super([new SystemAddressFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.SYSTEM_ADDRESS) {
            objects = await super.load<SystemAddress>(
                token, KIXObjectType.SYSTEM_ADDRESS, this.RESOURCE_URI, loadingOptions, objectIds, 'SystemAddress'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.SYSTEM_ADDRESS, 'SystemAddressID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.SYSTEM_ADDRESS, 'SystemAddressID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }
}
