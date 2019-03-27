import {
    ChannelsResponse
} from '../../../api';
import {
    TicketType, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectCache, Error, Channel
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';

export class ChannelService extends KIXObjectService {

    private static INSTANCE: ChannelService;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }
        return ChannelService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'channels';

    public kixObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;
        await this.getChannels(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.CHANNEL) {
            const channels = await this.getChannels(token);
            if (objectIds && objectIds.length) {
                objects = channels.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = channels;
            }
        }

        return objects;
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        throw new Error('0', 'Method not implemented');
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('0', 'Method not implemented');
    }

    public async getChannels(token: string): Promise<Channel[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.CHANNEL)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<ChannelsResponse>(token, uri);
            response.Channel
                .map((c) => new Channel(c))
                .forEach((t) => KIXObjectCache.addObject(KIXObjectType.CHANNEL, t));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.CHANNEL);
    }
}
