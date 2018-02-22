import { ObjectService } from './ObjectService';
import { IDynamicFieldService } from '@kix/core/dist/services';
import { DynamicField, DynamicFieldType, DynamicFieldObject, SortOrder } from '@kix/core/dist/model/';
import {
    CreateDynamicField,
    CreateDynamicFieldRequest,
    CreateDynamicFieldResponse,
    DynamicFieldConfigResponse,
    DynamicFieldResponse,
    DynamicFieldsResponse,
    DynamicFieldTypesResponse,
    DynamicFieldObjectsResponse,
    UpdateDynamicField,
    UpdateDynamicFieldResponse,
    UpdateDynamicFieldRequest
} from '@kix/core/dist/api';

export class DynamicFieldService extends ObjectService<DynamicField> implements IDynamicFieldService {

    protected RESOURCE_URI: string = "dynamicfields";

    public async getDynamicFields(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<DynamicField[]> {

        const response = await this.getObjects<DynamicFieldsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.DynamicField;
    }

    public async getDynamicField(token: string, dynamicFieldId: number, query?: any): Promise<DynamicField> {
        const response = await this.getObject<DynamicFieldResponse>(
            token, dynamicFieldId
        );

        return response.DynamicField;
    }

    public async createDynamicField(token: string, createDynamicField: CreateDynamicField): Promise<number> {
        const response = await this.createObject<CreateDynamicFieldResponse, CreateDynamicFieldRequest>(
            token, this.RESOURCE_URI, new CreateDynamicFieldRequest(createDynamicField)
        );

        return response.DynamicFieldID;
    }

    public async updateDynamicField(
        token: string, dynamicFieldId: number, updateDynamicField: UpdateDynamicField
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, dynamicFieldId);
        const response = await this.updateObject<UpdateDynamicFieldResponse, UpdateDynamicFieldRequest>(
            token, uri, new UpdateDynamicFieldRequest(updateDynamicField)
        );

        return response.DynamicFieldID;
    }

    public async deleteDynamicField(token: string, dynamicFieldId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, dynamicFieldId);
        await this.deleteObject<void>(token, uri);
    }

    public async getDynamicFieldTypes(token: string, query?: any): Promise<DynamicFieldType[]> {
        const response =
            await this.httpService.get<DynamicFieldTypesResponse>(this.RESOURCE_URI + '/types', query, token);
        return response.DynamicFieldType;
    }

    public async getDynamicFieldObjects(token: string, query?: any): Promise<DynamicFieldObject[]> {
        const response =
            await this.httpService.get<DynamicFieldObjectsResponse>(this.RESOURCE_URI + '/objects', query, token);
        return response.DynamicFieldObject;
    }

    public async getDynamicFieldConfig(token: string, dynamicFieldId: number): Promise<any> {
        const response = await this.httpService.get<DynamicFieldConfigResponse>(
            this.RESOURCE_URI + '/' + dynamicFieldId + '/config', null, token
        );
        return response.DynamicFieldConfig;
    }

}
