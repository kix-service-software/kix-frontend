import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export class SystemAddress extends KIXObject {

    public KIXObjectType: KIXObjectType;

    public ObjectId: string | number;

    public ChangeBy: number;
    public ChangeTime: string;
    public Comment: string;
    public CreateBy: number;
    public CreateTime: string;
    public ID: string | number;
    public Name: string;
    public Realname: string;
    public ValidID: number;

    public constructor(
        systemAddress?: SystemAddress
    ) {
        super();
        if (systemAddress) {
            this.ID = systemAddress.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = systemAddress.ChangeBy;
            this.ChangeTime = systemAddress.ChangeTime;
            this.Comment = systemAddress.Comment;
            this.CreateBy = systemAddress.CreateBy;
            this.CreateTime = systemAddress.CreateTime;
            this.Name = systemAddress.Name;
            this.Realname = systemAddress.Realname;
            this.ValidID = systemAddress.ValidID;
        }
    }

    public equals(systemAddress: SystemAddress): boolean {
        return this.ID === systemAddress.ID;
    }

}
