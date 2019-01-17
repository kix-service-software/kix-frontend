import { KIXObjectService } from './KIXObjectService';
import {
    DynamicField, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, Error
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

    protected RESOURCE_URI: string = "dynamicfields";

    public kixObjectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD;
    }

    public async loadObjects<O>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
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

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
