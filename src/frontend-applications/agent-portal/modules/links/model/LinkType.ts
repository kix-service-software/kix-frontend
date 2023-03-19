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

export class LinkType extends KIXObject {

    public KIXObjectType: KIXObjectType | string = KIXObjectType.LINK_TYPE;

    public ObjectId: string | number;

    public TypeID: number;

    public Name: string;

    public Source: string;

    public SourceName: string;

    public Target: string;

    public TargetName: string;

    public Pointed: number;

    public constructor(linkType?: LinkType) {
        super();
        if (linkType) {
            this.TypeID = linkType.TypeID;
            this.ObjectId = this.TypeID;
            this.Name = linkType.Name;
            this.Source = linkType.Source;
            this.SourceName = linkType.SourceName;
            this.Target = linkType.Target;
            this.TargetName = linkType.TargetName;
            this.Pointed = linkType.Pointed;
        }
    }

    public equals(linkType: LinkType): boolean {
        return this.TypeID === linkType.TypeID;
    }

    public getIdPropertyName(): string {
        return 'TypeID';
    }
}
