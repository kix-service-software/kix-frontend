import { IObjectFactory } from "../IObjectFactory";
import { SystemAddress } from "./SystemAddress";
import { KIXObjectType } from "../KIXObjectType";

export class SystemAddressFactory implements IObjectFactory<SystemAddress> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public create(systemaddress?: SystemAddress): SystemAddress {
        return new SystemAddress(systemaddress);
    }

}
