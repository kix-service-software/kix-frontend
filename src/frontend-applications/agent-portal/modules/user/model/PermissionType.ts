/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class PermissionType extends KIXObject {

    public KIXObjectType: KIXObjectType | string = KIXObjectType.PERMISSION;

    public ObjectId: number;

    public ID: number;

    public Name: string;

    public Comment: string;

    public ValidID: number;

    public CreateTime: string;

    public CreateBy: number;

    public ChangeTime: string;

    public ChangeBy: number;

    public constructor(permissionType?: PermissionType) {
        super();
        if (permissionType) {
            this.ID = Number(permissionType.ID);
            this.ObjectId = this.ID;
            this.CreateBy = permissionType.CreateBy;
            this.CreateTime = permissionType.CreateTime;
            this.ChangeBy = permissionType.ChangeBy;
            this.ChangeTime = permissionType.ChangeTime;
            this.Name = permissionType.Name;
            this.Comment = permissionType.Comment;
            this.ValidID = permissionType.ValidID;
        }
    }

    public equals(permissionType: PermissionType): boolean {
        return this.ID === permissionType.ID;
    }

}
