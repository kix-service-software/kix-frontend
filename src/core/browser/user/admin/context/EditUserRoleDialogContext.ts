/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
