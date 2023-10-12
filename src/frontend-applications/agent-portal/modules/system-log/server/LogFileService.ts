/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { LogFile } from '../model/LogFile';
import { LogTier } from '../model/LogTier';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class LogFileService extends KIXObjectAPIService {

    private static INSTANCE: LogFileService;

    public static getInstance(): LogFileService {
        if (!LogFileService.INSTANCE) {
            LogFileService.INSTANCE = new LogFileService();
        }
        return LogFileService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'logs');

    public objectType: KIXObjectType | string = KIXObjectType.LOG_FILE;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.LOG_FILE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse<LogFile>();

        if (objectType === KIXObjectType.LOG_FILE) {
            if (!Array.isArray(objectIds)) {
                objectResponse = await super.load<LogFile>(
                    token, KIXObjectType.LOG_FILE, this.RESOURCE_URI, loadingOptions, objectIds, 'LogFile',
                    clientRequestId, LogFile, false
                );

                objectResponse.objects?.forEach((lf) => lf.tier = LogTier.BACKEND);

                const feLogFiles = await LoggingService.getInstance().getLogFiles();
                objectResponse.objects = [
                    ...objectResponse.objects,
                    ...feLogFiles
                ];
            } else {
                const tierParameter = loadingOptions?.query?.find((q) => q[0] === 'tier');
                if (tierParameter && tierParameter[1] === LogTier.FRONTEND) {
                    const tailParameter = loadingOptions?.query?.find((q) => q[0] === 'Tail');
                    const logLevelParameter = loadingOptions?.query?.find((q) => q[0] === 'Categories');
                    const logFile = await LoggingService.getInstance().getLogFile(
                        objectIds[0].toString(), true,
                        tailParameter ? Number(tailParameter[1]) : null,
                        logLevelParameter ? logLevelParameter[1].split(',') : []
                    );
                    objectResponse.objects.push(logFile);
                } else {
                    objectResponse = await super.load<LogFile>(
                        token, KIXObjectType.LOG_FILE, this.RESOURCE_URI, loadingOptions, objectIds,
                        'LogFile', clientRequestId, LogFile, false
                    );

                    objectResponse.objects.forEach((lf) => lf.tier = LogTier.BACKEND);
                }
            }
        }

        return objectResponse as any;
    }

}
