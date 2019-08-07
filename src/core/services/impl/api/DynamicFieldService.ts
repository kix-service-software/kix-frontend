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
    DynamicField, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions
} from '../../../model';
import { DynamicFieldsResponse, DynamicFieldResponse } from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class DynamicFieldService extends KIXObjectService {

    private static INSTANCE: DynamicFieldService;

    public static getInstance(): DynamicFieldService {
        if (!DynamicFieldService.INSTANCE) {
            DynamicFieldService.INSTANCE = new DynamicFieldService();
        }
        return DynamicFieldService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'dynamicfields');

    public objectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.DYNAMIC_FIELD) {
            objects = await this.getDynamicFields(token, objectIds, loadingOptions);
        }

        return objects;
    }

    public async getDynamicFields(
        token: string, dynamicFieldIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<DynamicField[]> {

        const ids = dynamicFieldIds ? dynamicFieldIds.join(',') : null;
        let uri = this.buildUri(this.RESOURCE_URI);
        if (ids) {
            uri = this.buildUri(this.RESOURCE_URI, ids);
        }

        const query = this.prepareQuery(loadingOptions);
        if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'DynamicField', token, query);
        }

        const response = await this.getObjectByUri<DynamicFieldResponse | DynamicFieldsResponse>(token, uri, query);
        let result = [];
        if (dynamicFieldIds && dynamicFieldIds.length === 1) {
            result = [(response as DynamicFieldResponse).DynamicField];
        } else {
            result = (response as DynamicFieldsResponse).DynamicField;
        }

        return result.map((df) => new DynamicField(df));
    }

}
