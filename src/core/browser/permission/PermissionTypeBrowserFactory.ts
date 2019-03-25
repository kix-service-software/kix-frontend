import { PermissionType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class PermissionTypeBrowserFactory implements IKIXObjectFactory<PermissionType> {

    private static INSTANCE: PermissionTypeBrowserFactory;

    public static getInstance(): PermissionTypeBrowserFactory {
        if (!PermissionTypeBrowserFactory.INSTANCE) {
            PermissionTypeBrowserFactory.INSTANCE = new PermissionTypeBrowserFactory();
        }
        return PermissionTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(permissionType: PermissionType): Promise<PermissionType> {
        return new PermissionType(permissionType);
    }

}
