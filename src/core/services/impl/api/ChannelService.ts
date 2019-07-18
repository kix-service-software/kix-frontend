/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, Channel
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ChannelFactory } from '../../object-factories/ChannelFactory';

export class ChannelService extends KIXObjectService {

    private static INSTANCE: ChannelService;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }
        return ChannelService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'communication', 'channels');

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
            objects = await super.load<Channel>(
                token, KIXObjectType.CHANNEL, this.RESOURCE_URI, loadingOptions, objectIds, 'Channel'
            );
        }

        return objects;
    }

}
