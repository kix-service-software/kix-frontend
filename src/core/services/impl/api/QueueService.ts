import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { QueueFactory } from '../../object-factories/QueueFactory';
import { FollowUpTypeFactory } from '../../object-factories/FollowUpTypeFactory';

export class QueueService extends KIXObjectService {

    private static INSTANCE: QueueService;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }
        return QueueService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'queues');

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    private constructor() {
        super([new QueueFactory(), new FollowUpTypeFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.QUEUE) {
            const uri = this.buildUri(this.RESOURCE_URI);
            objects = await super.load(token, KIXObjectType.QUEUE, uri, loadingOptions, objectIds, KIXObjectType.QUEUE);
        } else if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'followuptypes');
            objects = await super.load(
                token, KIXObjectType.FOLLOW_UP_TYPE, uri, loadingOptions, null, KIXObjectType.FOLLOW_UP_TYPE
            );
            if (objectIds && objectIds.length) {
                objects = objects.filter((q) => objectIds.some((oid) => oid.toString() === q.ObjectId.toString()));
            }
        }
        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, this.RESOURCE_URI, this.objectType, 'QueueID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, uri, this.objectType, 'QueueID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }
}
