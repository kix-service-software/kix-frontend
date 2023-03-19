/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class Permission extends KIXObject {

    public KIXObjectType: KIXObjectType | string = KIXObjectType.PERMISSION;

    public ObjectId: number;

    public ID: number;

    public TypeID: number;

    public RoleID: number;

    public Comment: string;

    public Value: number;

    public Target: string;

    public IsRequired: number;

    public CreateTime: string;

    public CreateBy: number;

    public ChangeTime: string;

    public ChangeBy: number;

    public constructor(permission?: Permission) {
        super();
        if (permission) {
            this.ID = Number(permission.ID);
            this.ObjectId = this.ID;
            this.CreateBy = permission.CreateBy;
            this.CreateTime = permission.CreateTime;
            this.ChangeBy = permission.ChangeBy;
            this.ChangeTime = permission.ChangeTime;
            this.TypeID = permission.TypeID;
            this.RoleID = permission.RoleID;
            this.Comment = permission.Comment;
            this.Value = permission.Value;
            this.Target = permission.Target;
            this.IsRequired = permission.IsRequired;
        }
    }

    public equals(permission: Permission): boolean {
        return this.ID === permission.ID;
    }

}
