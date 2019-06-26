import { Context } from "../../../../model/components/context/Context";
import {
    ContextDescriptor, ContextConfiguration, KIXObject, KIXObjectType,
    Role, KIXObjectLoadingOptions, RoleProperty
} from "../../../../model";
import { KIXObjectService } from "../../../kix";

export class EditUserRoleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-user-role-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.ROLE): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.ROLE) {
            const roleId = this.getObjectId();
            if (roleId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null,
                    [RoleProperty.USER_IDS, RoleProperty.PERMISSIONS, RoleProperty.CONFIGURED_PERMISSIONS]
                );
                const objects = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, [roleId], loadingOptions);
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

}
