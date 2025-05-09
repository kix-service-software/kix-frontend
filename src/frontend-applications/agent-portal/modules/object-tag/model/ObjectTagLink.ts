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

export class ObjectTagLink extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.OBJECT_TAG_LINK;

    public ID: number;

    public Name: string;

    public ObjectType: KIXObjectType | string;

    public ObjectID: number;

    public constructor( objectTagLink?: ObjectTagLink ) {
        super(objectTagLink);

        if (objectTagLink) {
            this.ID = objectTagLink.ID;
            this.Name = objectTagLink.Name;
            this.ObjectId = this.ID;
            this.ObjectID = this.ObjectID;
            this.ObjectType = this.ObjectType;
        }
    }

    public equals(objectTag: ObjectTagLink): boolean {
        return objectTag.ID === this.ID;
    }

}
