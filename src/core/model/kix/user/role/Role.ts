import { KIXObject } from "../../KIXObject";
import { KIXObjectType } from "../../KIXObjectType";
import { Permission } from "../../permission";

export class Role extends KIXObject<Role> {

    public KIXObjectType: KIXObjectType = KIXObjectType.ROLE;

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
