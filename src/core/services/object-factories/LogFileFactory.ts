import { ObjectFactory } from "./ObjectFactory";
import { KIXObjectType } from "../../model";
import { LogFile } from "../../model/kix/log";

export class LogFileFactory extends ObjectFactory<LogFile> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.LOG_FILE;
    }

    public create(logFile?: LogFile): LogFile {
        return new LogFile(logFile);
    }

}
