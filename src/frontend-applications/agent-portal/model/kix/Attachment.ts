/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDownloadableFile } from '../IDownloadableFile';
import { KIXObject } from './KIXObject';
import { KIXObjectType } from './KIXObjectType';

export class Attachment extends KIXObject implements IDownloadableFile {

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

    public downloadId: string;

    public downloadSecret: string;

    public md5Sum: string;

    public base64: boolean = true;

    public path: string;

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
            this.base64 = true;

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
