import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class LogFile extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.LOG_FILE;

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
        }
    }

}
