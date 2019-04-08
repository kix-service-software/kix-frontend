import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Permission {

    public KIXObjectType: KIXObjectType = KIXObjectType.PERMISSION;

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
