import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ObjectIcon extends KIXObject<ObjectIcon> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.OBJECT_ICON;

    public ID: number;

    public ContentType: string;

    public Content: string;

    public CreateBy: string;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public constructor(
        public Object: string,
        public ObjectID: number | string,
        contentType?: string,
        content?: string,
        id?: number,
        createBy?: string,
        createTime?: string,
        changeBy?: number,
        changeTime?: string,
    ) {
        super();

        this.ContentType = contentType;
        this.Content = content;
        this.ID = id;
        this.ObjectId = this.ID;
        this.CreateTime = createTime;
        this.CreateBy = createBy;
        this.ChangeTime = changeTime;
        this.ChangeBy = changeBy;
    }

    public equals(object: ObjectIcon): boolean {
        return object.ObjectID === this.ObjectID && object.Object === object.Object;
    }

}
