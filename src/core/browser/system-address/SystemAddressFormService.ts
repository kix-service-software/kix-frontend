import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, SystemAddress } from "../../model";

export class SystemAddressFormService extends KIXObjectFormService<SystemAddress> {

    private static INSTANCE: SystemAddressFormService = null;

    public static getInstance(): SystemAddressFormService {
        if (!SystemAddressFormService.INSTANCE) {
            SystemAddressFormService.INSTANCE = new SystemAddressFormService();
        }

        return SystemAddressFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }
}
