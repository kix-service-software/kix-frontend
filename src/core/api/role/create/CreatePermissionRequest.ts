import { CreatePermission } from "./CreatePermission";

export class CreatePermissionRequest {

    public Permission: CreatePermission;

    public constructor(permission: CreatePermission) {
        this.Permission = permission;
    }

}
