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

export class Link extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.LINK;

    public ID: number;

    public SourceObject: string;

    public SourceKey: string;

    public TargetObject: string;

    public TargetKey: string;

    public Type: string;

    public CreateBy: number;

    public CreateTime: string;

    public constructor(link?: Link) {
        super();
        if (link) {
            this.ID = link.ID;
            this.SourceObject = link.SourceObject;
            this.SourceKey = link.SourceKey;
            this.TargetObject = link.TargetObject;
            this.TargetKey = link.TargetKey;
            this.Type = link.Type;
            this.CreateBy = link.CreateBy;
            this.CreateTime = link.CreateTime;
            this.ObjectId = link.ObjectId || this.ID;
        }
    }

    public equals(object: Link): boolean {
        return object.ID === this.ID;
    }

}
