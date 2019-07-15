import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LogFileFactory } from '../../object-factories/LogFileFactory';
import { LogFile } from '../../../model/kix/log';

export class LogFileService extends KIXObjectService {

    private static INSTANCE: LogFileService;

    public static getInstance(): LogFileService {
        if (!LogFileService.INSTANCE) {
            LogFileService.INSTANCE = new LogFileService();
        }
        return LogFileService.INSTANCE;
    }

    private constructor() {
        super([new LogFileFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'logs');

    public objectType: KIXObjectType = KIXObjectType.LOG_FILE;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.LOG_FILE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.LOG_FILE) {
            objects = await super.load<LogFile>(
                token, KIXObjectType.LOG_FILE, this.RESOURCE_URI, loadingOptions, objectIds, 'LogFile'
            );
        }

        return objects;
    }

}
