import { IObjectFactory } from "../IObjectFactory";
import { Channel } from "./Channel";
import { KIXObjectType } from "../KIXObjectType";

export class ChannelFactory implements IObjectFactory<Channel> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CHANNEL;
    }

    public create(channel?: Channel): Channel {
        return new Channel(channel);
    }

}
