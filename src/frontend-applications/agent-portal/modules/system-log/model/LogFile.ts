/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { LogTier } from './LogTier';

export class LogFile extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.LOG_FILE;

    public AccessTime: string;

    public AccessTimeUnix: number;

    public CreateTime: string;

    public CreateTimeUnix: number;

    public DisplayName: string;

    public Filename: string;

    public Filesize: string;

    public FilesizeRaw: number;

    public ID: string;

    public ModifyTime: string;

    public ModifyTimeUnix: number;

    public Content: string;

    public tier: LogTier;

    public constructor(logFile?: LogFile) {
        super(logFile);
        if (logFile) {
            this.ID = logFile.ID;
            this.ObjectId = this.ID;
            this.Filename = logFile.Filename;
            this.AccessTime = logFile.AccessTime;
            this.AccessTimeUnix = logFile.AccessTimeUnix;
            this.CreateTime = logFile.CreateTime;
            this.CreateTimeUnix = logFile.CreateTimeUnix;
            this.DisplayName = logFile.DisplayName;
            this.Filesize = logFile.Filesize;
            this.FilesizeRaw = logFile.FilesizeRaw;
            this.ModifyTime = logFile.ModifyTime;
            this.ModifyTimeUnix = logFile.ModifyTimeUnix;
            this.Content = logFile.Content;
            this.tier = logFile.tier;
        }
    }

}
