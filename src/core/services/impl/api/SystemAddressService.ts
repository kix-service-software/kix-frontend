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

        const createAddress = new CreateSystemAddresses(parameter);

        const response = await this.sendCreateRequest<CreateSystemAddressesResponse, CreateSystemAddressesRequest>(
            token, clientRequestId, this.RESOURCE_URI,
            new CreateSystemAddressesRequest(createAddress), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.SystemAddressID;

    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error("0", 'Method not implemented.');
    }

}
