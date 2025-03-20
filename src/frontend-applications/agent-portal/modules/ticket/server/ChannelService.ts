/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { Channel } from '../model/Channel';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class ChannelAPIService extends KIXObjectAPIService {

    private static INSTANCE: ChannelAPIService;

    public static getInstance(): ChannelAPIService {
        if (!ChannelAPIService.INSTANCE) {
            ChannelAPIService.INSTANCE = new ChannelAPIService();
        }
        return ChannelAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'communication', 'channels');

    public objectType: KIXObjectType = KIXObjectType.CHANNEL;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse<Channel>();
        if (objectType === KIXObjectType.CHANNEL) {
            objectResponse = await super.load<Channel>(
                token, KIXObjectType.CHANNEL, this.RESOURCE_URI, null, objectIds,
                KIXObjectType.CHANNEL, clientRequestId, Channel
            );

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter((t) => objectIds.some((oid) => oid === t.ID));
            }
        }

        return objectResponse as any;
    }

}
