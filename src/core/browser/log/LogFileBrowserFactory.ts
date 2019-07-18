/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
