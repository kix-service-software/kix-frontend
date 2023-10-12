/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ConfigItemImage extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_IMAGE;

    public ID: string;

    public ConfigItemID: number;

    public Filename: string;

    public ContentType: string;

    public Content: string;

    public Comment: string = '';

    public constructor(image?: ConfigItemImage) {
        super();
        if (image) {
            this.ID = image.ID;
            this.ObjectId = this.ID;
            this.ConfigItemID = Number(image.ConfigItemID);
            this.Filename = image.Filename;
            this.Content = image.Content;
            this.ContentType = image.ContentType;
            this.Comment = image.Comment || '';
        }
    }

    public equals(image: ConfigItemImage): boolean {
        return this.ID === image.ID && this.ConfigItemID === image.ConfigItemID;
    }

}
