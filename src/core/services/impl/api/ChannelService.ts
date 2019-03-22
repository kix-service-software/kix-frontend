import { ChannelsResponse } from '../../../api';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, Channel, ChannelFactory
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class ChannelService extends KIXObjectService {

    private static INSTANCE: ChannelService;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }
        return ChannelService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'channels';

    public objectType: KIXObjectType = KIXObjectType.CHANNEL;

    private constructor() {
        super([new ChannelFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
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
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        throw new Error('0', 'Method not implemented');
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('0', 'Method not implemented');
    }

    public async getChannels(token: string): Promise<Channel[]> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<ChannelsResponse>(token, uri);
        return response.Channel.map((c) => new Channel(c));
    }
}
