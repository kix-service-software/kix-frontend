import { PermissionRequestObject } from "./PermissionRequestObject";

export class CUPermissionRequest {

    public Permission: PermissionRequestObject;

    public constructor(permission: PermissionRequestObject) {
        this.Permission = permission;
    }

}
