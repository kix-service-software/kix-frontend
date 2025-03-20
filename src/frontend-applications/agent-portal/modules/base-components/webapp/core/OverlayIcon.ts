/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class OverlayIcon {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.OVERLAY_ICON;

    public Icon: string = null;

    public Data: any = null;

    public Title: string;

    public Content: string;

    public IsHint: boolean = false;

    public IsCustom: boolean = false;

    public constructor(
        overlayIcon?: OverlayIcon, title?: string, content?: string,
        icon?: string, data?: any, isHint?: boolean, isCustom?: boolean
    ) {

        if (overlayIcon) {
            this.Title = overlayIcon.Title;
            this.Data = overlayIcon.Data;
            this.Icon = overlayIcon.Icon;
            this.Content = overlayIcon.Content;
            this.IsHint = overlayIcon.IsHint;
            this.IsCustom = overlayIcon.IsCustom;
        }
        else {
            this.Title = title;
            this.Data = data;
            this.Icon = icon;
            this.Content = content;
            this.IsHint = isHint;
            this.IsCustom = isCustom;
        }

    }

    public equals(object: OverlayIcon): boolean {
        return object.ObjectId === this.ObjectId;
    }
}

