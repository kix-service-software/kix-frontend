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
import { ObjectSearch } from '../model/ObjectSearch';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { ObjectSearchLoadingOptions } from '../model/ObjectSearchLoadingOptions';
import { CacheService } from '../../../server/services/cache';

export class ObjectSearchAPIService extends KIXObjectAPIService {

    private static INSTANCE: ObjectSearchAPIService;

    public static getInstance(): ObjectSearchAPIService {
        if (!ObjectSearchAPIService.INSTANCE) {
            ObjectSearchAPIService.INSTANCE = new ObjectSearchAPIService();
        }
        return ObjectSearchAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
        CacheService.getInstance().addDependencies(KIXObjectType.DYNAMIC_FIELD, [KIXObjectType.OBJECT_SEARCH]);
    }

    protected RESOURCE_URI: string = this.buildUri('objectsearch');

    public objectType: KIXObjectType | string = KIXObjectType.OBJECT_SEARCH;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_SEARCH;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: ObjectSearchLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse([], 0);

        if (objectLoadingOptions?.objectType && objectType === KIXObjectType.OBJECT_SEARCH) {
            const uri = this.buildUri(this.RESOURCE_URI, objectLoadingOptions.objectType);
            objectResponse = await super.load<ObjectSearch>(
                token, objectType, uri, undefined, undefined,
                'SupportedAttributes', clientRequestId, ObjectSearch
            );
        }

        return objectResponse as any;
    }

}
