import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ObjectIcon extends KIXObject<ObjectIcon> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.OBJECT_ICON;

    public ID: number;

    public Object: string;

    public ObjectID: string | number;

    public ContentType: string;

    public Content: string;

    public constructor(
        object?: string, id?: string | number, contentType?: string, content?: any, objectIcon?: ObjectIcon
    ) {
        super(objectIcon);

        if (objectIcon) {
            this.ContentType = objectIcon.ContentType;
            this.Content = objectIcon.Content;
            this.ID = objectIcon.ID;
            this.ObjectId = this.ID;
            this.Object = objectIcon.Object;
            this.ObjectID = objectIcon.ObjectID;
        } else {
            this.ObjectID = id;
            this.Object = object;
            this.ContentType = contentType;
            this.Content = content;
        }
    }

    public equals(object: ObjectIcon): boolean {
        return object.ObjectID === this.ObjectID && object.Object === object.Object;
    }

}
