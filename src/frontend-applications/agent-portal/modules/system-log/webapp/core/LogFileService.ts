/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { LogFile } from '../../model/LogFile';

export class LogFileService extends KIXObjectService {

    private static INSTANCE: LogFileService;

    public static getInstance(): LogFileService {
        if (!LogFileService.INSTANCE) {
            LogFileService.INSTANCE = new LogFileService();
        }
        return LogFileService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.LOG_FILE);
        this.objectConstructors.set(KIXObjectType.LOG_FILE, [LogFile]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.LOG_FILE;
    }

    public getLinkObjectName(): string {
        return 'LogFile';
    }


}
