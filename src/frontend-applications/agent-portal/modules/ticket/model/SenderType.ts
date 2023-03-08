/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class SenderType extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.SENDER_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(senderType?: SenderType) {
        super();
        if (senderType) {
            this.ID = senderType.ID;
            this.ObjectId = this.ID;
            this.Name = senderType.Name;
        }
    }

    public equals(senderType: SenderType): boolean {
        return this.ID === senderType.ID;
    }

    public toString(): string {
        return this.Name;
    }

}
