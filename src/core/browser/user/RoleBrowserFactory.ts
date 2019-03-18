import { Role } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class RoleBrowserFactory implements IKIXObjectFactory<Role> {

    private static INSTANCE: RoleBrowserFactory;

    public static getInstance(): RoleBrowserFactory {
        if (!RoleBrowserFactory.INSTANCE) {
            RoleBrowserFactory.INSTANCE = new RoleBrowserFactory();
        }
        return RoleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(type: Role): Promise<Role> {
        return new Role(type);
    }

}
