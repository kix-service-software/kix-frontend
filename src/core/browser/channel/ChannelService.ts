import { Channel, KIXObjectType } from "../../model";
import { KIXObjectService } from "../kix";

export class ChannelService extends KIXObjectService<Channel> {

    private static INSTANCE: ChannelService = null;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }

        return ChannelService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public getLinkObjectName(): string {
        return 'Channel';
    }
}
