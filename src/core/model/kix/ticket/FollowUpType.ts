import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";

export class FollowUpType extends KIXObject<FollowUpType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.FOLLOW_UP_TYPE;

    public ObjectId: string | number;
    public ID: number;
    public Name: string;
    public Comment: string;
    public ValidID: number;

    public constructor(followUpType?: FollowUpType) {
        super();
        if (followUpType) {
            this.ID = Number(followUpType.ID);
            this.ObjectId = this.ID;
            this.Name = followUpType.Name;
            this.Comment = followUpType.Comment;
            this.ValidID = followUpType.ValidID;
        }
    }

    public equals(followUpType: FollowUpType): boolean {
        return this.ID === followUpType.ID;
    }

}
