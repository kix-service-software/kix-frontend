import { KIXObjectService } from "../kix";
import { SystemAddress, KIXObjectType } from "../../model";

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

}
