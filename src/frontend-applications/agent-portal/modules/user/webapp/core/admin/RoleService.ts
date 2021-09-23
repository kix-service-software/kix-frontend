/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Role } from '../../../model/Role';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Permission } from '../../../model/Permission';
import { PermissionType } from '../../../model/PermissionType';

export class RoleService extends KIXObjectService<Role> {

    private static INSTANCE: RoleService = null;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }

        return RoleService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.ROLE);
        this.objectConstructors.set(KIXObjectType.ROLE, [Role]);
        this.objectConstructors.set(KIXObjectType.PERMISSION, [Permission]);
        this.objectConstructors.set(KIXObjectType.PERMISSION_TYPE, [PermissionType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.ROLE
            || kixObjectType === KIXObjectType.PERMISSION
            || kixObjectType === KIXObjectType.PERMISSION_TYPE;
    }

    protected async prepareUpdateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        parameter.push([property, value]);
        return parameter;
    }

    public getLinkObjectName(): string {
        return 'Role';
    }

}
