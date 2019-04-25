import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, QueueFactory
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class QueueService extends KIXObjectService {

    private static INSTANCE: QueueService;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }
        return QueueService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'queues';

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    private constructor() {
        super([new QueueFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.QUEUE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.QUEUE) {
            const uri = this.buildUri(this.RESOURCE_URI);
            objects = await super.load(token, KIXObjectType.QUEUE, uri, loadingOptions, null, KIXObjectType.QUEUE);
            if (objectIds && objectIds.length) {
                objects = objects.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            }
        }
        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        // const createQueue = new CreateQueue(parameter);

        // const response = await this.sendCreateRequest<CreateQueueResponse, CreateQueueRequest>(
        //     token, clientRequestId, this.RESOURCE_URI, new CreateQueueRequest(createQueue),
        //     this.objectType
        // ).catch((error: Error) => {
        //     LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
        //     throw new Error(error.Code, error.Message);
        // });

        // const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        // if (icon) {
        //     icon.Object = 'Queue';
        //     icon.ObjectID = response.QueueID;
        //     await this.createIcons(token, clientRequestId, icon);
        // }

        // return response.QueueID;
        return;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        // const updateQueue = new UpdateQueue(parameter);

        // const response = await this.sendUpdateRequest<UpdateQueueResponse, UpdateQueueRequest>(
        //     token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
        //     new UpdateQueueRequest(updateQueue), this.objectType
        // ).catch((error: Error) => {
        //     LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
        //     throw new Error(error.Code, error.Message);
        // });
        // const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        // if (icon) {
        //     icon.Object = 'Queue';
        //     icon.ObjectID = response.QueueID;
        //     await this.updateIcon(token, clientRequestId, icon);
        // }

        // return response.QueueID;
        return;
    }
}
