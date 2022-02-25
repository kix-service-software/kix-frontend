/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';
import { LogFile } from '../../../model/LogFile';
import { LogFolder } from '../../../model/LogFolder';

export class LogFileTableCSSHandler implements ITableCSSHandler<LogFile> {

    public async getRowCSSClasses(logFile: LogFile): Promise<string[]> {
        const classes = ['log-download'];
        if (logFile instanceof LogFolder) {
            classes.push('log-folder-row');
        }
        return classes;
    }

    public async getValueCSSClasses(logFile: LogFile, value: TableValue): Promise<string[]> {
        return [];
    }


}
