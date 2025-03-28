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


export class HTMLToPDF extends KIXObject implements IDownloadableFile {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.HTML_TO_PDF;

    public Filename: string;

    public ContentType: string;

    public Content: string;

    public FilesizeRaw: number;

    public Filesize: string;

    public downloadId: string;

    public downloadSecret: string;

    public md5Sum: string;

    public base64: boolean = true;

    public path: string;


    public constructor(htmlToPDF?: HTMLToPDF) {
        super(htmlToPDF);

        if (htmlToPDF) {
            this.Filename = htmlToPDF.Filename;
            this.ObjectId = htmlToPDF.Filename;
            this.ContentType = htmlToPDF.ContentType;
            this.Content = htmlToPDF.Content;
            this.FilesizeRaw = htmlToPDF.FilesizeRaw;
            this.Filesize = htmlToPDF.Filesize;
        }
    }
}
