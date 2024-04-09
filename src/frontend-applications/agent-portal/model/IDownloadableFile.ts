/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from './kix/KIXObject';

export interface IDownloadableFile extends KIXObject {

    downloadId: string;

    downloadSecret: string;

    Content: string;

    Filename: string;

    FilesizeRaw: number;

    md5Sum: string;

    base64: boolean;

    path: string;
}