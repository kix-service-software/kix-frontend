/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { Queue } from '../model/Queue';
import { FollowUpType } from '../model/FollowUpType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { CacheService } from '../../../server/services/cache';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { QueueProperty } from '../model/QueueProperty';

export class QueueAPIService extends KIXObjectAPIService {

    private static INSTANCE: QueueAPIService;

    public static getInstance(): QueueAPIService {
        if (!QueueAPIService.INSTANCE) {
            QueueAPIService.INSTANCE = new QueueAPIService();
        }
        return QueueAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'queues');

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
        CacheService.getInstance().addDependencies(KIXObjectType.TICKET, ['QUEUE_HIERARCHY']);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.QUEUE) {
            objectClass = Queue;
        }
        return objectClass;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.QUEUE) {
            const uri = this.buildUri(this.RESOURCE_URI);
            objectResponse = await super.load<Queue>(
                token, KIXObjectType.QUEUE, uri, loadingOptions, null, KIXObjectType.QUEUE, clientRequestId, Queue
            ).catch((e): ObjectResponse<Queue> => {
                return new ObjectResponse();
            });

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (t: Queue) => objectIds.some((oid) => Number(oid) === Number(t.QueueID))
                );
            }
        } else if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'followuptypes');
            objectResponse = await super.load<FollowUpType>(
                token, KIXObjectType.FOLLOW_UP_TYPE, uri, loadingOptions, null, KIXObjectType.FOLLOW_UP_TYPE,
                clientRequestId, FollowUpType
            );
            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (f: FollowUpType) => objectIds.some((oid) => oid.toString() === f.ObjectId.toString())
                );
            }
        }
        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const index = parameter.findIndex((p) => p[0] === QueueProperty.ASSIGNED_PERMISSIONS);
        if (index !== -1) {
            const permissions = parameter[index][1];
            parameter.splice(index, 1);
            parameter.push([QueueProperty.PERMISSIONS, permissions]);
        }

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
        const index = parameter.findIndex((p) => p[0] === QueueProperty.ASSIGNED_PERMISSIONS);
        if (index !== -1) {
            const permissions = parameter[index][1];
            parameter.splice(index, 1);
            parameter.push([QueueProperty.PERMISSIONS, permissions]);
        }

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
