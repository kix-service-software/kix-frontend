/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FileService } from '../../file/server/FileService';
import { UserService } from '../../user/server/UserService';
import { User } from '../../user/model/User';

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
        return kixObjectType === KIXObjectType.LOG_FILE ||
            kixObjectType === KIXObjectType.LOG_FILE_DOWNLOAD;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse<LogFile>();
        let logFiles: LogFile[] = [];

        if (!Array.isArray(objectIds)) {
            logFiles = await this.loadLogFiles(token, loadingOptions, clientRequestId);
        } else {
            logFiles = await this.loadLogFilesById(token, loadingOptions, clientRequestId, objectIds);
        }

        if (objectType === KIXObjectType.LOG_FILE_DOWNLOAD) {
            const user = await UserService.getInstance().getUserByToken(token).catch((): User => null);

            for (const lf of logFiles) {
                FileService.prepareFileForDownload(user?.UserID, lf);
            }
        }

        objectResponse.objects.push(...logFiles);

        return objectResponse as any;
    }

    private async loadLogFiles(
        token: string, loadingOptions: KIXObjectLoadingOptions, clientRequestId: string
    ): Promise<LogFile[]> {
        let logFiles = [];

        const tierParameter = loadingOptions?.query?.find((q) => q[0] === 'tier');
        if (!tierParameter || tierParameter[1] === LogTier.BACKEND) {

            const objectResponse = await super.load<LogFile>(
                token, KIXObjectType.LOG_FILE, this.RESOURCE_URI, loadingOptions, null, 'LogFile',
                clientRequestId, LogFile, false
            );

            objectResponse.objects?.forEach((lf) => lf.tier = LogTier.BACKEND);
            logFiles.push(...objectResponse.objects);
        }

        if (!tierParameter || tierParameter[1] === LogTier.FRONTEND) {
            const feLogFiles = await LoggingService.getInstance().getLogFiles();
            logFiles.push(...feLogFiles);
        }

        return logFiles;
    }

    private async loadLogFilesById(
        token: string, loadingOptions: KIXObjectLoadingOptions,
        clientRequestId: string, objectIds: Array<number | string>
    ): Promise<LogFile[]> {
        const logFiles: LogFile[] = [];

        const tierParameter = loadingOptions?.query?.find((q) => q[0] === 'tier');
        if (tierParameter && tierParameter[1] === LogTier.FRONTEND) {
            const tailParameter = loadingOptions?.query?.find((q) => q[0] === 'Tail');
            const logLevelParameter = loadingOptions?.query?.find((q) => q[0] === 'Categories');
            const logFile = await LoggingService.getInstance().getLogFile(
                objectIds[0].toString(),
                tailParameter ? Number(tailParameter[1]) : null,
                logLevelParameter ? logLevelParameter[1].split(',') : []
            );
            logFile.path = 'logs';
            logFiles.push(logFile);
        } else {
            loadingOptions.includes.push('Content');
            const objectResponse = await super.load<LogFile>(
                token, KIXObjectType.LOG_FILE, this.RESOURCE_URI, loadingOptions, objectIds,
                'LogFile', clientRequestId, LogFile, false
            );

            objectResponse.objects.forEach((lf) => lf.tier = LogTier.BACKEND);
            logFiles.push(...objectResponse.objects);
            logFiles.forEach((lf) => lf.base64 = true);
        }

        return logFiles;
    }

}
