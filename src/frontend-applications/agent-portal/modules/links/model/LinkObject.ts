/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LinkType } from './LinkType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class LinkObject extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.LINK_OBJECT;

    public linkedObjectType: KIXObjectType | string;

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
