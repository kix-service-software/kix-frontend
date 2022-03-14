/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { RoleProperty } from '../../../../model/RoleProperty';
import { Role } from '../../../../model/Role';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';

export class EditUserRoleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-user-role-dialog-context';

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType | string = KIXObjectType.ROLE
    ): Promise<O> {
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
