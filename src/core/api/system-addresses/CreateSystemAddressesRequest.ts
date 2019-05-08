import { CreateSystemAddresses } from "./CreateSystemAddresses";

export class CreateSystemAddressesRequest {

    public SystemAddress: CreateSystemAddresses;

    public constructor(createSystemAddress: CreateSystemAddresses) {
        this.SystemAddress = createSystemAddress;
    }

}
