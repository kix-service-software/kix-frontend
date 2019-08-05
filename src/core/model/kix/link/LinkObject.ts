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
import { LinkType } from "./LinkType";

export class LinkObject extends KIXObject<LinkObject> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public linkedObjectType: KIXObjectType;

    public linkedObjectKey: string;

    public linkedObjectDisplayId: string;

    public title: string;

    public linkedAs: string;

    public isSource: boolean;

    public linkType: LinkType;

    public constructor(linkObject?: LinkObject) {
        super();
        if (linkObject) {
            this.ObjectId = linkObject.ObjectId;
            this.linkedObjectType = linkObject.linkedObjectType;
            this.linkedObjectKey = linkObject.linkedObjectKey;
            this.linkedObjectDisplayId = linkObject.linkedObjectDisplayId;
            this.title = linkObject.title;
            this.linkedAs = linkObject.linkedAs;
            this.isSource = linkObject.isSource;
            this.linkType = linkObject.linkType;
        }
    }

    public equals(object: LinkObject): boolean {
        return object.ObjectId === this.ObjectId;
    }

}
