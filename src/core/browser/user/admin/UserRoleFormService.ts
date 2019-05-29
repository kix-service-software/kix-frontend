import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, Role } from "../../../model";

export class UserRoleFormService extends KIXObjectFormService<Role> {

    private static INSTANCE: UserRoleFormService = null;

    public static getInstance(): UserRoleFormService {
        if (!UserRoleFormService.INSTANCE) {
            UserRoleFormService.INSTANCE = new UserRoleFormService();
        }

        return UserRoleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ROLE;
    }
}
