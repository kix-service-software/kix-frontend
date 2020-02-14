/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { RoleProperty } from "../../../model/RoleProperty";


export class UserRoleFormService extends KIXObjectFormService {

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

    public isServiceFor(kixObjectType: KIXObjectType | string) {
        return kixObjectType === KIXObjectType.ROLE;
    }

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
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
}
