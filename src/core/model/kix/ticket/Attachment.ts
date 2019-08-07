/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class Attachment {

    public ID: number;

    public ContentAlternative: string;

    public ContentID: string;

    public ContentType: string;

    public Filename: string;

    public Filesize: string;

    public FilesizeRaw: number;

    public Content: string;

    public Disposition: string;

    public constructor(attachment?: Attachment) {
        if (attachment) {
            this.ID = attachment.ID;
            this.ContentAlternative = attachment.ContentAlternative;
            this.ContentID = attachment.ContentID;
            this.ContentType = attachment.ContentType;
            this.Filename = attachment.Filename;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = attachment.FilesizeRaw;
            this.Content = attachment.Content;
            this.Disposition = attachment.Disposition;
        }
    }

}
