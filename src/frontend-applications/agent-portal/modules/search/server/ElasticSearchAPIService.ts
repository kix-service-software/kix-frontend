/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class ElasticSearchAPIService extends KIXObjectAPIService {

    private static INSTANCE: ElasticSearchAPIService;

    public static getInstance(): ElasticSearchAPIService {
        if (!ElasticSearchAPIService.INSTANCE) {
            ElasticSearchAPIService.INSTANCE = new ElasticSearchAPIService();
        }
        return ElasticSearchAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'objectsearch';

    public objectType: KIXObjectType = KIXObjectType.ELASTIC_SEARCH;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ELASTIC_SEARCH;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse([], 0);
        if (objectType === KIXObjectType.ELASTIC_SEARCH) {

            if (!loadingOptions?.query) {
                loadingOptions.query = [];
            }

            const uri = this.buildUri(
                this.RESOURCE_URI, 'fulltext'
            );

            objectResponse = await super.load(
                token, KIXObjectType.ELASTIC_SEARCH, uri, loadingOptions, objectIds, KIXObjectType.ELASTIC_SEARCH,
                clientRequestId, null, undefined, true
            );
        }

        return objectResponse;
    }
}