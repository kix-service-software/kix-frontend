import { KIXObjectService } from "../kix";
import { KIXObjectType } from "../../model";

export class LogFileService extends KIXObjectService {

    private static INSTANCE: LogFileService;

    public static getInstance(): LogFileService {
        if (!LogFileService.INSTANCE) {
            LogFileService.INSTANCE = new LogFileService();
        }
        return LogFileService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.LOG_FILE;
    }

    public getLinkObjectName(): string {
        return 'LogFile';
    }


}
