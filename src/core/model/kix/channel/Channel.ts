import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Channel extends KIXObject<Channel> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public ID: number;

    public Name: string;

    public constructor(channel?: Channel) {
        super(channel);
        if (channel) {
            this.ID = channel.ID;
            this.ObjectId = this.ID;
            this.Name = channel.Name;
        }
    }

    public equals(channel: Channel): boolean {
        return this.ID === channel.ID;
    }


}
