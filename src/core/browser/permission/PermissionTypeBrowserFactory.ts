/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PermissionType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class PermissionTypeBrowserFactory implements IKIXObjectFactory<PermissionType> {

    private static INSTANCE: PermissionTypeBrowserFactory;

    public static getInstance(): PermissionTypeBrowserFactory {
        if (!PermissionTypeBrowserFactory.INSTANCE) {
            PermissionTypeBrowserFactory.INSTANCE = new PermissionTypeBrowserFactory();
        }
        return PermissionTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(permissionType: PermissionType): Promise<PermissionType> {
        return new PermissionType(permissionType);
    }

}
