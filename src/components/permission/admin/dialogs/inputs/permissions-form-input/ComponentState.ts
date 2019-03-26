import { FormInputComponentState, PermissionProperty } from "../../../../../../core/model";
import { PermissionManager } from "../../../../../../core/browser/user";

export class ComponentState extends FormInputComponentState<any[]> {

    public constructor(
        public permissionManager: PermissionManager = null,
        public createTitle: string = PermissionProperty.CREATE,
        public readTitle: string = PermissionProperty.READ,
        public updateTitle: string = PermissionProperty.UPDATE,
        public deleteTitle: string = PermissionProperty.DELETE,
        public denyTitle: string = PermissionProperty.DENY,
        public requiredTitle: string = PermissionProperty.IS_REQUIRED
    ) {
        super();
    }

}
