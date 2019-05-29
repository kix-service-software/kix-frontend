import { IObjectFactory } from "../../IObjectFactory";
import { Role } from "./Role";
import { KIXObjectType } from "../../KIXObjectType";

export class RoleFactory implements IObjectFactory<Role> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ROLE;
    }

    public create(role?: Role): Role {
        return new Role(role);
    }

}
