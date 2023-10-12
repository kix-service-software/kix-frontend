/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class Channel extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public ID: number;

    public Name: string;

    public constructor(channel?: Channel) {
        super(channel);
        if (channel) {
            this.ID = channel.ID;
            this.ObjectId = this.ID;
            this.Name = channel.Name;
        }
    }

    public equals(channel: Channel): boolean {
        return this.ID === channel.ID;
    }


}
