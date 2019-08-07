/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Role } from "../../model";
import { KIXObjectFactory } from "../kix/KIXObjectFactory";

export class RoleBrowserFactory extends KIXObjectFactory<Role> {

    private static INSTANCE: RoleBrowserFactory;

    public static getInstance(): RoleBrowserFactory {
        if (!RoleBrowserFactory.INSTANCE) {
            RoleBrowserFactory.INSTANCE = new RoleBrowserFactory();
        }
        return RoleBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(type: Role): Promise<Role> {
        const role = new Role(type);
        return role;
    }

}
