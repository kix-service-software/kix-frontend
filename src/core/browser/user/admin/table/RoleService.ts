import { KIXObjectService } from "../../../kix";
import { KIXObjectType } from "../../../../model";
import { Role } from "../../../../model/kix/user";

export class RoleService extends KIXObjectService<Role> {

    private static INSTANCE: RoleService = null;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }

        return RoleService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ROLE;
    }

    public getLinkObjectName(): string {
        return 'Role';
    }

}
