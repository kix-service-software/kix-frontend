import {
    Channel, KIXObjectType, KIXObjectLoadingOptions, KIXObject, KIXObjectSpecificLoadingOptions
} from "../../model";
import { KIXObjectService } from "../kix";

export class ChannelService extends KIXObjectService<Channel> {

    private static INSTANCE: ChannelService = null;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }

        return ChannelService.INSTANCE;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        const channels = await super.loadObjects<Channel>(KIXObjectType.CHANNEL, null);
        if (objectIds) {
            const filteredChannels = channels.filter(
                (c) => objectIds.some((oid) => c.ID === oid)
            );

            return filteredChannels as any[];
        } else {
            return channels as any[];
        }
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public getLinkObjectName(): string {
        return 'Channel';
    }
}
