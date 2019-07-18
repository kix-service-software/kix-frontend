/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../kix/KIXObjectFormService";
import { KIXObjectType, Role } from "../../../model";

export class UserRoleFormService extends KIXObjectFormService<Role> {

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

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ROLE;
    }
}
