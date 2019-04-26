import { SystemAddress } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class SystemAddressBrowserFactory extends KIXObjectFactory<SystemAddress> {

    private static INSTANCE: SystemAddressBrowserFactory;

    public static getInstance(): SystemAddressBrowserFactory {
        if (!SystemAddressBrowserFactory.INSTANCE) {
            SystemAddressBrowserFactory.INSTANCE = new SystemAddressBrowserFactory();
        }
        return SystemAddressBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(systemAddress: SystemAddress): Promise<SystemAddress> {
        const newSystemAddress = new SystemAddress(systemAddress);
        return newSystemAddress;
    }

}
