import {
    SortOrder,
    QueuesResponse, QueueResponse,
    CreateQueue, CreateQueueRequest, CreateQueueResponse,
    UpdateQueue, UpdateQueueRequest, UpdateQueueResponse
} from "@kix/core/dist/api";

import { IQueueService } from '@kix/core/dist/services';
import { Queue } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class QueueService extends ObjectService<Queue> implements IQueueService {

    protected RESOURCE_URI: string = "queues";

    public async getQueues(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Queue[]> {

        const response = await this.getObjects<QueuesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Queue;
    }

    public async getQueue(token: string, queueId: number, query?: any): Promise<Queue> {
        const response = await this.getObject<QueueResponse>(
            token, queueId
        );

        return response.Queue;
    }

    public async createQueue(token: string, createQueue: CreateQueue): Promise<number> {
        const response = await this.createObject<CreateQueueResponse, CreateQueueRequest>(
            token, this.RESOURCE_URI, new CreateQueueRequest(createQueue)
        );

        return response.QueueID;
    }

    public async updateQueue(
        token: string, queueId: number, updateQueue: UpdateQueue
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, queueId);
        const response = await this.updateObject<UpdateQueueResponse, UpdateQueueRequest>(
            token, uri, new UpdateQueueRequest(updateQueue)
        );

        return response.QueueID;
    }

    public async deleteQueue(token: string, groupId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, groupId);
        await this.deleteObject<void>(token, uri);
    }

}
