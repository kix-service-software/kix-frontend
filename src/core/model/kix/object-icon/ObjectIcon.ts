/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ObjectIcon extends KIXObject<ObjectIcon> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.OBJECT_ICON;

    public ID: number;

    public Object: string;

    public ObjectID: string | number;

    public ContentType: string;

    public Content: string;

    public constructor(
        object?: string, id?: string | number, contentType?: string, content?: any, objectIcon?: ObjectIcon
    ) {
        super(objectIcon);

        if (objectIcon) {
            this.ContentType = objectIcon.ContentType;
            this.Content = objectIcon.Content;
            this.ID = objectIcon.ID;
            this.ObjectId = this.ID;
            this.Object = objectIcon.Object;
            this.ObjectID = objectIcon.ObjectID;
        } else {
            this.ObjectID = id;
            this.Object = object;
            this.ContentType = contentType;
            this.Content = content;
        }
    }

    public equals(object: ObjectIcon): boolean {
        return object.ObjectID === this.ObjectID && object.Object === object.Object;
    }

}
