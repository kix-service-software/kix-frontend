/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
