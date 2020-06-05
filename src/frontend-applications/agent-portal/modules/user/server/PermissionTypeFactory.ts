/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from '../../../server/model/ObjectFactory';
import { PermissionType } from '../model/PermissionType';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';


export class PermissionTypeFactory extends ObjectFactory<PermissionType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION_TYPE;
    }

    public async create(permissionType?: PermissionType): Promise<PermissionType> {
        return new PermissionType(permissionType);
    }

}
