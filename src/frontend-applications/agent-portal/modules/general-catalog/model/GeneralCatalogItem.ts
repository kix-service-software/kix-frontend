/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { GeneralCatalogItemPreference } from './GeneralCatalogItemPreference';

export class GeneralCatalogItem extends KIXObject {
    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    public ItemID: number;

    public Name: string;

    public Class: string;

    public Preferences: GeneralCatalogItemPreference[];

    public constructor(item?: GeneralCatalogItem) {
        super(item);
        if (item) {
            this.ItemID = Number(item.ItemID);
            this.ObjectId = this.ItemID;
            this.Name = item.Name;
            this.Class = item.Class;
        }
    }

    public equals(object: GeneralCatalogItem): boolean {
        return object.ItemID === this.ItemID;
    }

    public getIdPropertyName(): string {
        return 'ItemID';
    }

}
