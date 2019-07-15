import { IKIXObjectFactory } from '../kix';
import { LogFile } from '../../model/kix/log';

export class LogFileBrowserFactory implements IKIXObjectFactory<LogFile> {

    private static INSTANCE: LogFileBrowserFactory;

    public static getInstance(): LogFileBrowserFactory {
        if (!LogFileBrowserFactory.INSTANCE) {
            LogFileBrowserFactory.INSTANCE = new LogFileBrowserFactory();
        }
        return LogFileBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(logFile: LogFile): Promise<LogFile> {
        const newLogFile = new LogFile(logFile);
        return newLogFile;
    }

}
