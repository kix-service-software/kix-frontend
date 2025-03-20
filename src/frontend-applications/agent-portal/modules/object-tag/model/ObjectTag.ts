/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ObjectTag extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.OBJECT_TAG;

    public Name: string;

    public constructor( objectTag?: ObjectTag ) {
        super(objectTag);

        if (objectTag) {
            this.Name = objectTag.Name;
            this.ObjectId = this.Name;
        }
    }

    public equals(objectTag: ObjectTag): boolean {
        return objectTag.Name === this.Name;
    }

}
