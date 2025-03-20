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

export class ObjectIcon extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.OBJECT_ICON;

    public ID: number;

    public Object: string;

    public ObjectID: string | number;

    public ContentType: string;

    public Content: string;

    public fallbackIcon: ObjectIcon | string;

    public tooltip: string;

    public constructor(
        objectIcon?: ObjectIcon, object?: string, objectId?: string | number, contentType?: string, content?: any,
        fallbackIcon?: ObjectIcon | string, tooltip?: string
    ) {
        super(objectIcon);

        if (objectIcon) {
            this.ContentType = objectIcon.ContentType;
            this.Content = objectIcon.Content;
            this.ID = Number(objectIcon.ID);
            this.ObjectId = this.ID;
            this.Object = objectIcon.Object;
            this.ObjectID = objectIcon.ObjectID;
        } else {
            this.ObjectID = objectId;
            this.ObjectId = objectId;
            this.Object = object;
            this.ContentType = contentType;
            this.Content = content;
        }

        this.fallbackIcon = fallbackIcon;
        this.tooltip = tooltip;
    }

    public equals(object: ObjectIcon): boolean {
        return object.ObjectID === this.ObjectID && object.Object === object.Object;
    }

}
