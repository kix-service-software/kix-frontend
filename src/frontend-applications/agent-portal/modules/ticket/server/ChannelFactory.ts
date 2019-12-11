/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { Channel } from "../model/Channel";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";

export class ChannelFactory extends ObjectFactory<Channel> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CHANNEL;
    }

    public async create(channel?: Channel): Promise<Channel> {
        return new Channel(channel);
    }

}