/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../kix";
import { KIXObjectType } from "../../../model";
import { Role, RoleProperty } from "../../../model/kix/user";

export class RoleService extends KIXObjectService<Role> {

    private static INSTANCE: RoleService = null;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }

        return RoleService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ROLE
            || kixObjectType === KIXObjectType.PERMISSION
            || kixObjectType === KIXObjectType.PERMISSION_TYPE;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            if (property === RoleProperty.USER_IDS || property === RoleProperty.PERMISSIONS) {
                if (Array.isArray(value) && !!value.length) {
                    parameter.push([property, value]);
                }
            } else {
                parameter.push([property, value]);
            }
        }

        return parameter;
    }

    public getLinkObjectName(): string {
        return 'Role';
    }

}
