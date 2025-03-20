/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { Attachment } from '../../../model/kix/Attachment';

export class ConfigItemAttachment extends Attachment {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_ATTACHMENT;

    public ID: number;

    public AttachmentID: number;

    public Filesize: string;

    public FilesizeRaw: number;

    public Filename: string;

    public ContentType: string;

    public Content: string;

    public constructor(attachment?: ConfigItemAttachment) {
        super(attachment);
        if (attachment) {
            this.ID = attachment.ID ? Number(attachment.ID) : Number(attachment.AttachmentID);
            this.ObjectId = this.ID;
            this.AttachmentID = this.ID;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = attachment.FilesizeRaw;
            this.Filename = attachment.Filename;
            this.ContentType = attachment.ContentType;
            this.Content = attachment.Content;
        }
    }

    public equals(attachment: ConfigItemAttachment): boolean {
        return attachment.ID === this.ID;
    }

}
