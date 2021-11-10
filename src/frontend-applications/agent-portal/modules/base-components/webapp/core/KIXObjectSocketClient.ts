/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from './SocketClient';
import { ClientStorageService } from './ClientStorageService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { IdService } from '../../../../model/IdService';
import { LoadObjectsRequest } from './LoadObjectsRequest';
import { BrowserCacheService } from './CacheService';
import { LoadObjectsResponse } from './LoadObjectsResponse';
import { KIXObjectEvent } from './KIXObjectEvent';
import { PermissionError } from '../../../user/model/PermissionError';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { CreateObjectRequest } from './CreateObjectRequest';
import { CreateObjectResponse } from './CreateObjectResponse';
import { UpdateObjectRequest } from './UpdateObjectRequest';
import { UpdateObjectResponse } from './UpdateObjectResponse';
import { KIXObjectSpecificDeleteOptions } from '../../../../model/KIXObjectSpecificDeleteOptions';
import { DeleteObjectRequest } from './DeleteObjectRequest';
import { DeleteObjectResponse } from './DeleteObjectResponse';
import { ISocketResponse } from './ISocketResponse';
import { ISocketObjectRequest } from './ISocketObjectRequest';
import { SocketErrorResponse } from './SocketErrorResponse';
import { SocketEvent } from './SocketEvent';
import { Error } from '../../../../../../server/model/Error';
import { EventService } from './EventService';
import { ApplicationEvent } from './ApplicationEvent';

export class KIXObjectSocketClient extends SocketClient {

    private static INSTANCE: KIXObjectSocketClient;

    public static getInstance(): KIXObjectSocketClient {
        if (!KIXObjectSocketClient.INSTANCE) {
            KIXObjectSocketClient.INSTANCE = new KIXObjectSocketClient();
        }

        return KIXObjectSocketClient.INSTANCE;
    }

    private constructor() {
        super('kixobjects');
    }

    public async loadObjects<T extends KIXObject>(
        kixObjectType: KIXObjectType | string, objectConstructors: Array<new (object?: T) => T>,
        objectIds: Array<string | number> = null, loadingOptions: KIXObjectLoadingOptions = null,
        objectLoadingOptions: KIXObjectSpecificLoadingOptions = null, cache: boolean = true, timeout?: number
    ): Promise<T[]> {
        this.checkSocketConnection();

        const requestId = IdService.generateDateBasedId();

        const request = new LoadObjectsRequest(
            requestId, ClientStorageService.getClientRequestId(),
            kixObjectType, objectIds, loadingOptions, objectLoadingOptions
        );

        const cacheKey = JSON.stringify({ kixObjectType, objectIds, loadingOptions, objectLoadingOptions });

        let requestPromise: Promise<T[]>;
        if (cache) {
            requestPromise = BrowserCacheService.getInstance().get(cacheKey, kixObjectType);
            if (!requestPromise) {
                requestPromise = this.createRequestPromise<T>(request, objectConstructors, timeout);
                BrowserCacheService.getInstance().set(cacheKey, requestPromise, kixObjectType);

                requestPromise.catch((error) => {
                    BrowserCacheService.getInstance().delete(cacheKey, kixObjectType);
                });
            }
            return requestPromise;
        }

        requestPromise = this.createRequestPromise<T>(request, objectConstructors, timeout);
        return requestPromise;
    }

    private async createRequestPromise<T extends KIXObject>(
        request: LoadObjectsRequest, objectConstructors: Array<new (object?: T) => T>, timeout?: number
    ): Promise<T[]> {
        const response = await this.sendRequest<LoadObjectsResponse<T>>(
            request,
            KIXObjectEvent.LOAD_OBJECTS, KIXObjectEvent.LOAD_OBJECTS_FINISHED, timeout
        ).catch((error): LoadObjectsResponse<T> => {
            if (error instanceof PermissionError) {
                return new LoadObjectsResponse(request.clientRequestId, []);
            } else {
                throw error;
            }
        });

        let objects = response.objects;
        if (objectConstructors && objectConstructors.length) {
            const newObjects = [];
            for (const obj of objects) {
                let object = obj;
                for (const objectConstructor of objectConstructors) {
                    try {
                        object = new objectConstructor(object);
                    } catch (error) {
                        console.error(error);
                    }
                }
                newObjects.push(object);
            }

            objects = newObjects;
        }
        const objectIds = Array.isArray(request.objectIds)
            ? request.objectIds.join(',')
            : request.objectIds;
        return objects;
    }

    public async createObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        this.checkSocketConnection();

        const requestId = IdService.generateDateBasedId();

        const request = new CreateObjectRequest(
            requestId, ClientStorageService.getClientRequestId(), objectType, parameter, createOptions
        );

        const response = await this.sendRequest<CreateObjectResponse>(
            request,
            KIXObjectEvent.CREATE_OBJECT, KIXObjectEvent.CREATE_OBJECT_FINISHED, -1
        );

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);
        EventService.getInstance().publish(ApplicationEvent.OBJECT_CREATED, { objectType, objectId: response.result });

        return response.result;
    }

    public async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        objectId: number | string, updateOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        this.checkSocketConnection();

        const requestId = IdService.generateDateBasedId();

        const request = new UpdateObjectRequest(
            requestId, ClientStorageService.getClientRequestId(), objectType, parameter, objectId, updateOptions
        );

        const response = await this.sendRequest<UpdateObjectResponse>(
            request,
            KIXObjectEvent.UPDATE_OBJECT, KIXObjectEvent.UPDATE_OBJECT_FINISHED, -1
        );

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);

        if (!silent) {
            EventService.getInstance().publish(ApplicationEvent.OBJECT_UPDATED, { objectType, objectId });
        }

        return response.objectId;
    }

    public async deleteObject(
        objectType: KIXObjectType | string, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<any> {
        this.checkSocketConnection();

        const requestId = IdService.generateDateBasedId();

        const request = new DeleteObjectRequest(
            requestId, ClientStorageService.getClientRequestId(), objectType, objectId, deleteOptions
        );

        await this.sendRequest<DeleteObjectResponse>(
            request,
            KIXObjectEvent.DELETE_OBJECT, KIXObjectEvent.DELETE_OBJECT_FINISHED, -1
        );

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);
        EventService.getInstance().publish(ApplicationEvent.OBJECT_DELETED, { objectType, objectId });
    }

    private async sendRequest<T extends ISocketResponse>(
        requestObject: ISocketObjectRequest, event: string, finishEvent: string, defaultTimeout?: number
    ): Promise<T> {
        this.checkSocketConnection();

        const socketTimeout = defaultTimeout ? defaultTimeout : ClientStorageService.getSocketTimeout();

        return new Promise<T>((resolve, reject) => {
            let timeout: any;

            if (defaultTimeout > 0) {
                timeout = window.setTimeout(() => {
                    const timeoutInSeconds = socketTimeout / 1000;
                    // tslint:disable-next-line:max-line-length
                    const error = `Zeitüberschreitung der Anfrage (Event: ${event} - ${requestObject.objectType}) (Timeout: ${timeoutInSeconds} Sekunden)`;
                    console.error(error);
                    reject(new Error('TIMEOUT', error));
                }, socketTimeout);
            }

            this.socket.on(finishEvent, (result: T) => {
                if (result.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    const errorMessage = `Socket Error: Event - ${event}, Object - ${requestObject.objectType}`;
                    console.error(errorMessage);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.on(SocketEvent.PERMISSION_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    console.error('No permissions');
                    console.error(error.error);
                    const permissionError = error.error as PermissionError;
                    reject(new PermissionError(permissionError, permissionError.resource, permissionError.method));
                }
            });

            this.socket.emit(event, requestObject);
        });
    }

}
