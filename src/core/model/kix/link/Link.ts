import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Link extends KIXObject<Link> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.LINK;

    public ID: number;

    public SourceObject: string;

    public SourceKey: string;

    public TargetObject: string;

    public TargetKey: string;

    public Type: string;

    public CreateBy: number;

    public CreateTime: string;

    public constructor(link?: Link) {
        super();
        if (link) {
            this.ID = link.ID;
            this.SourceObject = link.SourceObject;
            this.SourceKey = link.SourceKey;
            this.TargetObject = link.TargetObject;
            this.TargetKey = link.TargetKey;
            this.Type = link.Type;
            this.CreateBy = link.CreateBy;
            this.CreateTime = link.CreateTime;
            this.ObjectId = link.ObjectId || this.ID;
        }
    }

    public equals(object: Link): boolean {
        return object.ID === this.ID;
    }

}
