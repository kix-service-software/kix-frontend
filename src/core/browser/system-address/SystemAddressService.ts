import { KIXObjectService } from "../kix";
import {
    SystemAddress, KIXObjectType, KIXObject, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, KIXObjectCache
} from "../../model";

export class SystemAddressService extends KIXObjectService<SystemAddress> {

    private static INSTANCE: SystemAddressService = null;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }

        return SystemAddressService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public getLinkObjectName(): string {
        return 'SystemAddress';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.SYSTEM_ADDRESS) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((q) => KIXObjectCache.addObject(objectType, q));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }
}
