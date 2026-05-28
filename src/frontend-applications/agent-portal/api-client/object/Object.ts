/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../model/KIXObjectSpecificLoadingOptions';
import { BrowserCacheService } from '../../modules/base-components/webapp/core/CacheService';
import { KIXObjectSpecificCreateOptions } from '../../model/KIXObjectSpecificCreateOptions';
import { EventService } from '../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../modules/base-components/webapp/core/ApplicationEvent';
import { CollectionManager } from './CollectionManager';
import { APIClient } from '../APIClient';
import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { Error } from '../../../../server/model/Error';

export class ObjectAPIClient extends APIClient {

    private static cachedCountMap: Map<string, [number, number, number]> = new Map();

    public static async loadDisplayValue(
        objectType: KIXObjectType | string, objectId: string | number
    ): Promise<string> {
        const cacheKey = 'DisplayValue' + JSON.stringify({ objectType, objectId });
        let requestPromise = BrowserCacheService.getInstance().get(cacheKey, objectType);
        if (!requestPromise) {
            requestPromise = new Promise<string>((resolve, reject) => {
                this.executeRequest(RequestMethod.GET, `/object/${objectType}/${objectId}/displayvalue`)
                    .then(async (response) => {
                        try {
                            const result = await response.json();
                            let displayValue = result?.displayValue;
                            if (response.status !== 200) {
                                displayValue = '';
                            }
                            resolve(displayValue);
                        } catch (e) {
                            reject(e);
                        }
                    });
            });
            BrowserCacheService.getInstance().set(cacheKey, requestPromise, objectType);
        }

        return requestPromise;
    }

    // eslint-disable-next-line max-lines-per-function
    public static async loadObjects<T extends KIXObject>(
        objectType: KIXObjectType | string, objectConstructors: Array<new (object?: T) => T>,
        objectIds: Array<string | number> = null, loadingOptions: KIXObjectLoadingOptions = null,
        objectLoadingOptions: KIXObjectSpecificLoadingOptions = null, cache: boolean = true, timeout?: number,
        silent?: boolean, collectionId?: string
    ): Promise<T[]> {
        if (!loadingOptions) {
            loadingOptions = new KIXObjectLoadingOptions();
        }

        if (!loadingOptions.query) {
            loadingOptions.query = [];
        }

        const params = {
            loadingOptions: JSON.stringify(loadingOptions),
            objectLoadingOptions: JSON.stringify(objectLoadingOptions)
        };

        let requestPromise: Promise<T[]>;
        if (cache) {
            const cacheType = loadingOptions?.cacheType || objectType;
            const cacheKey = JSON.stringify({ cacheType, objectIds, loadingOptions, objectLoadingOptions });

            requestPromise = BrowserCacheService.getInstance().get(cacheKey, cacheType);
            if (!requestPromise) {
                requestPromise = this.createLoadRequestPromise<T>(
                    objectType, objectIds, params, loadingOptions?.limit, objectConstructors,
                    timeout, silent, collectionId, cacheKey
                );
                BrowserCacheService.getInstance().set(cacheKey, requestPromise, cacheType);

                requestPromise.catch((error) => {
                    BrowserCacheService.getInstance().delete(cacheKey, cacheType);
                });
            } else if (collectionId && this.cachedCountMap.has(cacheKey)) {
                // update counts if same collectionId was used but diferrent caches exisist
                const countValues = this.cachedCountMap.get(cacheKey);
                CollectionManager.getInstance().handleResult(
                    collectionId, countValues[0], countValues[1], countValues[2]
                );
            }
        } else {
            requestPromise = this.createLoadRequestPromise<T>(
                objectType, objectIds, params, loadingOptions?.limit, objectConstructors,
                timeout, silent, collectionId
            );
        }

        return requestPromise;
    }

    // eslint-disable-next-line max-lines-per-function
    private static async createLoadRequestPromise<T extends KIXObject>(
        objectType: string, objectIds: Array<string | number> = null, params: any, limit: number,
        objectConstructors: Array<new (object?: T) => T>, timeout?: number, silent?: boolean, collectionId?: string,
        cacheKey?: string
    ): Promise<T[]> {

        let controller: AbortController;

        if (collectionId) {
            const oldController = CollectionManager.getInstance().get(collectionId);
            if (oldController) {
                oldController.abort();
            }

            controller = new AbortController();
            CollectionManager.getInstance().set(collectionId, controller);
        }

        const response = await fetch(this.getUrl(`/object/${objectType}`, objectIds, params), {
            method: 'GET',
            headers: this.prepareHeaders()
        });

        let objects: T[];
        const result = await response.json();

        if (response.status === 200) {
            CollectionManager.getInstance().handleResult(
                collectionId, result.objects?.length, limit, result.totalCount
            );
            if (cacheKey) {
                this.cachedCountMap.set(cacheKey, [result.objects?.length, limit, result.totalCount]);
            }
            objects = result.objects;
        } else if (response.status === 401) {
            throw new Error(result?.Code, result?.Message, response.status);
        } else if (response.status === 403 || result?.StatusCode === 403) {
            console.error(result);
            objects = [];
        } else {
            const errorMessage = JSON.stringify(result);
            if (!silent) {
                // FIXME: notify error with portal notifications
                // this.notifyError(errorMessage);
            }
            console.error(errorMessage);
            throw errorMessage;
        }

        if (collectionId) {
            CollectionManager.getInstance().delete(collectionId);
        }

        objects = this.prepareResultObjects(objects, objectConstructors);

        return objects;
    }

    private static prepareResultObjects<T = any>(objects: T[], objectConstructors: Array<new (object?: T) => T>): T[] {
        const newObjects = [];
        for (const obj of objects) {
            let object = obj;
            if (objectConstructors?.length) {
                for (const objectConstructor of objectConstructors) {
                    try {
                        object = new objectConstructor(object);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
            newObjects.push(object);
        }
        return newObjects;
    }

    public static async createObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]> = null,
        createOptions: KIXObjectSpecificCreateOptions = null, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const response = await this.executeRequest(
            RequestMethod.POST, `/object/${objectType}`, { parameter, createOptions }
        );
        const result = await response.json();
        const objectId = result?.id;

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);
        EventService.getInstance().publish(ApplicationEvent.OBJECT_CREATED, { objectType, objectId });

        return objectId;
    }

    public static async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]> = null,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions = null,
        cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        await this.executeRequest(
            RequestMethod.PATCH, `/object/${objectType}`, { parameter, updateOptions }, undefined, [objectId]
        );

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);

        if (!silent) {
            EventService.getInstance().publish(ApplicationEvent.OBJECT_UPDATED, { objectType, objectId });
        }

        return objectId;
    }

    public static async deleteObject(
        objectType: KIXObjectType | string, objectId: string | number, cacheKeyPrefix: string = objectType
    ): Promise<any> {
        await this.executeRequest(RequestMethod.DELETE, `/object/${objectType}`, undefined, undefined, [objectId]);
        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);
        EventService.getInstance().publish(ApplicationEvent.OBJECT_DELETED, { objectType, objectId });
    }

    public static async commitObject<T extends KIXObject = KIXObject>(object: T): Promise<number | string> {
        const response = await this.executeRequest(
            RequestMethod.POST, `/object/${object?.KIXObjectType}`, { object }, { commit: 1 }
        );

        const result = await response.json();
        const objectId = result.id;

        BrowserCacheService.getInstance().deleteKeys(object.KIXObjectType);
        EventService.getInstance().publish(
            ApplicationEvent.OBJECT_CREATED, { objectType: object.KIXObjectType, objectId }
        );
        EventService.getInstance().publish(
            ApplicationEvent.OBJECT_UPDATED, { objectType: object.KIXObjectType, objectId }
        );
        return objectId;
    }

}
