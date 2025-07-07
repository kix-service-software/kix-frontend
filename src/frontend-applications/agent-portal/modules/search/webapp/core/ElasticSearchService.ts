/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';


export class ElasticSearchService extends KIXObjectService {

    private static INSTANCE: ElasticSearchService = null;

    public static getInstance(): ElasticSearchService {
        if (!ElasticSearchService.INSTANCE) {
            ElasticSearchService.INSTANCE = new ElasticSearchService();
        }

        return ElasticSearchService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.ELASTIC_SEARCH);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ELASTIC_SEARCH;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.ELASTIC_SEARCH) {
            objects = await super.loadObjects<O>(
                KIXObjectType.ELASTIC_SEARCH, null, loadingOptions);
        } else {
            superLoad = true;

            objects = await super.loadObjects<O>(
                objectType, objectIds, loadingOptions, objectLoadingOptions, cache, forceIds, silent, collectionId
            );
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }
}