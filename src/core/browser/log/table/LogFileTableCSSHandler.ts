/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler, TableValue } from "../../table";
import { LogFile } from "../../../model/kix/log";

export class LogFileTableCSSHandler implements ITableCSSHandler<LogFile> {

    public async getRowCSSClasses(logFile: LogFile): Promise<string[]> {
        return ['linked-row'];
    }

    public async getValueCSSClasses(logFile: LogFile, value: TableValue): Promise<string[]> {
        return [];
    }


}
