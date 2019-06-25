import { ObjectFactory } from "./ObjectFactory";
import { SystemAddress, KIXObjectType } from "../../model";

export class SystemAddressFactory extends ObjectFactory<SystemAddress> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public create(systemaddress?: SystemAddress): SystemAddress {
        return new SystemAddress(systemaddress);
    }

}
