import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class PermissionType extends KIXObject<PermissionType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.PERMISSION;

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
