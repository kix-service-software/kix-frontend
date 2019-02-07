import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Channel extends KIXObject<Channel> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public ChangeBy: number;

    public ChangeTime: string;

    public Comment: string;

    public CreateBy: number;

    public CreateTime: string;

    public ID: number;

    public Name: string;

    public ValidID: number;

    public constructor(channel?: Channel) {
        super();
        if (channel) {
            this.ID = channel.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = channel.ChangeBy;
            this.ChangeTime = channel.ChangeTime;
            this.CreateBy = channel.CreateBy;
            this.CreateTime = channel.CreateTime;
            this.Name = channel.Name;
            this.ValidID = channel.ValidID;
        }
    }

    public equals(channel: Channel): boolean {
        return this.ID === channel.ID;
    }


}
