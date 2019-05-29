import { Role } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class RoleBrowserFactory extends KIXObjectFactory<Role> {

    private static INSTANCE: RoleBrowserFactory;

    public static getInstance(): RoleBrowserFactory {
        if (!RoleBrowserFactory.INSTANCE) {
            RoleBrowserFactory.INSTANCE = new RoleBrowserFactory();
        }
        return RoleBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(type: Role): Promise<Role> {
        const role = new Role(type);
        return role;
    }

}
