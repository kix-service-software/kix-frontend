import { FormInputComponentState } from "../../../../../../core/model";
import { PermissionManager } from "../../../../../../core/browser/user";

export class ComponentState extends FormInputComponentState<any[]> {

    public constructor(
        public permissionManager: PermissionManager = new PermissionManager()
    ) {
        super();
    }

}
