import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, QueueFactory, FollowUpTypeFactory, ObjectIcon, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { QueueRequestObject, CUQueueResponse, CUQueueRequest } from '../../../api';

export class QueueService extends KIXObjectService {

    private static INSTANCE: QueueService;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }
        return QueueService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'queues';
    protected SUB_RESOUCE_URI: string = 'followuptypes';

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
            const uri = this.buildUri(this.RESOURCE_URI, this.SUB_RESOUCE_URI);
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
        const createParameter = parameter.filter(
            (p) => p[0] !== 'ICON'
        );
        const createQueue = new QueueRequestObject(createParameter);

        const response = await this.sendCreateRequest<CUQueueResponse, CUQueueRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CUQueueRequest(createQueue),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Queue';
            icon.ObjectID = response.QueueID;
            await this.createIcons(token, clientRequestId, icon);
        }

        return response.QueueID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        // const updateParameter = parameter.filter(
        //     (p) => p[0] !== 'ICON'
        // );
        // const updateQueue = new UpdateQueue(updateParameter);

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
