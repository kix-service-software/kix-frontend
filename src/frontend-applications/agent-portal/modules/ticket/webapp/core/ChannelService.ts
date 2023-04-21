/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Channel } from '../../model/Channel';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';

export class ChannelService extends KIXObjectService<Channel> {

    private static INSTANCE: ChannelService = null;

    public static getInstance(): ChannelService {
        if (!ChannelService.INSTANCE) {
            ChannelService.INSTANCE = new ChannelService();
        }

        return ChannelService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.CHANNEL);
        this.objectConstructors.set(KIXObjectType.CHANNEL, [Channel]);
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        const channels = await super.loadObjects<Channel>(KIXObjectType.CHANNEL, null);
        if (objectIds) {
            const filteredChannels = channels.filter(
                (c) => objectIds.map((id) => Number(id)).some((oid) => c.ID === oid)
            );

            return filteredChannels as any[];
        } else {
            return channels as any[];
        }
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CHANNEL;
    }

    public getLinkObjectName(): string {
        return 'Channel';
    }
}
