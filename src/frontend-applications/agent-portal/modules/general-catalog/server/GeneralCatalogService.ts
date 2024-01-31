/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { GeneralCatalogItem } from '../model/GeneralCatalogItem';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class GeneralCatalogService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('system', 'generalcatalog');

    protected objectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    private constructor() {
        super();

        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.GENERAL_CATALOG_CLASS;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let objectResponse = new ObjectResponse();

        if (objectType === KIXObjectType.GENERAL_CATALOG_ITEM) {
            objectResponse = await super.load(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'GeneralCatalogItem',
                clientRequestId, GeneralCatalogItem
            );
        } else if (objectType === KIXObjectType.GENERAL_CATALOG_CLASS) {
            const uri = this.buildUri('system', 'generalcatalog', 'classes');
            objectResponse = await super.load<string>(
                token, KIXObjectType.GENERAL_CATALOG_CLASS, uri, null, null, 'GeneralCatalogClass', clientRequestId
            );
            if (objectIds) {
                objectResponse.objects = objectResponse.objects?.filter(
                    (o) => objectIds.some((oi) => oi?.toString() === o?.toString())
                );
            }
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {

        const uri = this.buildUri('system', 'generalcatalog');
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.GENERAL_CATALOG_ITEM, 'GeneralCatalogItemID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }
    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, uri, this.objectType, 'GeneralCatalogItemID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return id;
    }

}
