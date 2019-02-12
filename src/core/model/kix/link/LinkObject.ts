import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { LinkType } from "./LinkType";

export class LinkObject extends KIXObject<LinkObject> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public linkedObjectType: KIXObjectType;

    public linkedObjectKey: string;

    public linkedObjectDisplayId: string;

    public title: string;

    public linkedAs: string;

    public isSource: boolean;

    public linkType: LinkType;

    public constructor(linkObject?: LinkObject) {
        super();
        if (linkObject) {
            this.ObjectId = linkObject.ObjectId;
            this.linkedObjectType = linkObject.linkedObjectType;
            this.linkedObjectKey = linkObject.linkedObjectKey;
            this.linkedObjectDisplayId = linkObject.linkedObjectDisplayId;
            this.title = linkObject.title;
            this.linkedAs = linkObject.linkedAs;
            this.isSource = linkObject.isSource;
            this.linkType = linkObject.linkType;
        }
    }

    public equals(object: LinkObject): boolean {
        return object.ObjectId === this.ObjectId;
    }

}
