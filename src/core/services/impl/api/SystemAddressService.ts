import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectCache, Error, SystemAddress
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { SystemAddressesResponse } from '../../../api';

export class SystemAddressService extends KIXObjectService {

    private static INSTANCE: SystemAddressService;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }
        return SystemAddressService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'systemaddresses';

    public kixObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        await this.getSystemAddresses(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.SYSTEM_ADDRESS) {
            const systemAddresses = await this.getSystemAddresses(token);
            if (objectIds && objectIds.length) {
                objects = systemAddresses.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = systemAddresses;
            }
        }

        return objects;
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        throw new Error("0", 'Method not implemented.');
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error("0", 'Method not implemented.');
    }

    public async getSystemAddresses(token: string): Promise<SystemAddress[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.SYSTEM_ADDRESS)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<SystemAddressesResponse>(token, uri);
            response.SystemAddress
                .map((sa) => new SystemAddress(sa))
                .forEach((sa) => KIXObjectCache.addObject(KIXObjectType.SYSTEM_ADDRESS, sa));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.SYSTEM_ADDRESS);
    }
}
