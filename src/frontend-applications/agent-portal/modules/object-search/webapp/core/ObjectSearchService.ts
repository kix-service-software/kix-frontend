/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { ClientStorageService } from '../../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ObjectSearch } from '../../model/ObjectSearch';

export class ObjectSearchService extends KIXObjectService {

    private static INSTANCE: ObjectSearchService;

    public static getInstance(): ObjectSearchService {
        if (!ObjectSearchService.INSTANCE) {
            ObjectSearchService.INSTANCE = new ObjectSearchService();
        }
        return ObjectSearchService.INSTANCE;
    }

    private readonly subscriber: IEventSubscriber;

    private constructor() {
        super(KIXObjectType.OBJECT_SEARCH);
        this.objectConstructors.set(KIXObjectType.OBJECT_SEARCH, [ObjectSearch]);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('ObjectSearchService'),
            eventPublished: function (data: string, eventId: string): void {
                if (data === KIXObjectType.OBJECT_SEARCH) {
                    const keys = ClientStorageService.getAllKeys(KIXObjectType.OBJECT_SEARCH);
                    for (let key of keys) {
                        ClientStorageService.deleteState(key);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.CACHE_KEY_DELETED, this.subscriber);
        EventService.getInstance().subscribe(ApplicationEvent.CACHE_KEY_PREFIX_DELETED, this.subscriber);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_SEARCH;
    }

    public getLinkObjectName(): string {
        return '';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions, cache?: boolean, forceIds?: boolean,
        silent?: boolean, collectionId?: string
    ): Promise<O[]> {

        const key = objectType + '-' + JSON.stringify(objectLoadingOptions);

        let result;
        const cachedValue = ClientStorageService.getOption(key);
        if (cachedValue) {
            result = cachedValue ? JSON.parse(cachedValue) : null;
        } else {
            result = await super.loadObjects<O>(
                objectType, objectIds, loadingOptions, objectLoadingOptions, cache, forceIds, silent, collectionId
            );
            ClientStorageService.setOption(key, JSON.stringify(result));
        }

        return result;

    }

}
