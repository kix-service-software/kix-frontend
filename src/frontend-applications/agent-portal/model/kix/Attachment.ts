/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from './KIXObject';
import { KIXObjectType } from './KIXObjectType';

export class Attachment extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.ATTACHMENT;

    public ID: number;

    public ContentAlternative: string;

    public ContentID: string;

    public ContentType: string;

    public Filename: string;

    public Filesize: string;

    public FilesizeRaw: number;

    public Content: string;

    public Disposition: string;

    public charset: string;

    public constructor(attachment?: Attachment) {
        super(attachment);
        if (attachment) {
            this.ID = attachment.ID;
            this.ObjectId = this.ID;
            this.ContentAlternative = attachment.ContentAlternative;
            this.ContentID = attachment.ContentID;
            this.ContentType = attachment.ContentType;
            this.Filename = attachment.Filename;
            this.Filesize = attachment.Filesize;
            this.FilesizeRaw = attachment.FilesizeRaw;
            this.Content = attachment.Content;
            this.Disposition = attachment.Disposition;

            this.prepareContentType();
        }
    }

    public prepareContentType(): void {
        if (this.ContentType && this.ContentType.indexOf(';') !== -1) {
            const attributes = this.ContentType.split(';');
            if (attributes.length) {
                this.ContentType = attributes[0].trim();
                if (attributes[1]) {
                    this.charset = attributes[1].trim().replace(/charset=['"]?(.+)['"]?/, '$1');
                }
            }
        }
    }

    public static getHumanReadableContentSize(size: number): string {
        let readableSize: string;

        if (size < 1024) {
            readableSize = size + ' Bytes';
        } else if (size >= 1024 && size < 1024000) {
            readableSize = (size / 1024).toFixed(1) + ' KBytes';
        } else if (size >= 1024000) {
            readableSize = (size / 1024000).toFixed(1) + ' MBytes';
        }

        return readableSize;
    }

}
