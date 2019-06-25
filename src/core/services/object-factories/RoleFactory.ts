import { ObjectFactory } from "./ObjectFactory";
import { Role, KIXObjectType } from "../../model";

export class RoleFactory extends ObjectFactory<Role> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ROLE;
    }

    public create(role?: Role): Role {
        return new Role(role);
    }

}
