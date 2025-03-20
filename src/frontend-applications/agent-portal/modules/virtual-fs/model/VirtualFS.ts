/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDownloadableFile } from '../../../model/IDownloadableFile';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class VirtualFS extends KIXObject implements IDownloadableFile {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.VIRTUAL_FS;

    public Content: string;

    public FilesizeRaw: number;

    public Filesize: string;

    public FileID: number;

    public Filename: string;

    public downloadId: string;

    public downloadSecret: string;

    public md5Sum: string;

    public base64: boolean;

    public path: string;

    public constructor(virtualFS?: VirtualFS) {
        super(virtualFS);

        if (virtualFS) {
            this.FileID = Number(virtualFS.FileID) || null;

            this.ObjectId = this.FileID;

            this.Content = virtualFS.Content;
            this.Filename = virtualFS.Filename;
            this.FilesizeRaw = virtualFS.FilesizeRaw;

            if (!virtualFS.Filesize) {
                this.Filesize = this.getFileSize();
            }
        } else {
            this.Filesize = null;
            this.FilesizeRaw = null;
            this.FileID = null;
            this.Filename = null;
            this.Content = null;
        }
    }

    public getFileSize(): string {
        let sizeString = this.FilesizeRaw + ' Byte';
        const siteUnits = ['kB', 'MB', 'GB'];
        for (
            let newSize = this.FilesizeRaw / 1000, sizeUnit = 0;
            newSize >= 1 && sizeUnit < 3;
            newSize /= 1000, sizeUnit++
        ) {
            sizeString = newSize.toFixed(1) + ' ' + siteUnits[sizeUnit];
        }
        return sizeString;
    }

    public equals(virtualFS: VirtualFS): boolean {
        return this.FileID === virtualFS.FileID;
    }

    public getIdPropertyName(): string {
        return 'FileID';
    }

}
