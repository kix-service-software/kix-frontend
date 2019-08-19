/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from './KIXObjectService';
import {
    GeneralCatalogItem, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
} from '../../../model';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { GeneralCatalogItemFactory } from '../../object-factories/GeneralCatalogItemFactory';

export class GeneralCatalogService extends KIXObjectService {

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
        super([new GeneralCatalogItemFactory()]);

        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        const query = this.prepareQuery(loadingOptions);
        let objects = [];

        if (objectType === KIXObjectType.GENERAL_CATALOG_ITEM) {
            objects = await super.load(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'GeneralCatalogItem'
            );
        }

        return objects;
    }

}
