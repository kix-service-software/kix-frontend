/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { Permission } from "./Permission";

export class Role extends KIXObject<Role> {

    public KIXObjectType: KIXObjectType | string = KIXObjectType.ROLE;

    public ObjectId: number;

    public ID: number;

    public CreateBy: number;

    public Name: string;

    public Comment: string;

    public ValidID: number;

    public CreateTime: string;

    public ChangeTime: string;

    public ChangeBy: number;

    public UserIDs: number[];

    public Permissions: Permission[];

    public constructor(role?: Role) {
        super(role);
        if (role) {
            this.ID = Number(role.ID);
            this.ObjectId = this.ID;
            this.CreateBy = role.CreateBy;
            this.CreateTime = role.CreateTime;
            this.ChangeBy = role.ChangeBy;
            this.ChangeTime = role.ChangeTime;
            this.Name = role.Name;
            this.Comment = role.Comment;
            this.ValidID = role.ValidID;
            this.UserIDs = role.UserIDs;
            this.Permissions = role.Permissions
                ? (role.Permissions as Permission[]).map((p) => new Permission(p))
                : [];
        }
    }

    public equals(role: Role): boolean {
        return this.ID === role.ID;
    }

}
