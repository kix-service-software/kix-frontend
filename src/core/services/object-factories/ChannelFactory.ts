import { ObjectFactory } from "./ObjectFactory";
import { Channel, KIXObjectType } from "../../model";

export class ChannelFactory extends ObjectFactory<Channel> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CHANNEL;
    }

    public create(channel?: Channel): Channel {
        return new Channel(channel);
    }

}
