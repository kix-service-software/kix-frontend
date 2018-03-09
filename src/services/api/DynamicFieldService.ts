import { ObjectService } from './ObjectService';
import { IDynamicFieldService } from '@kix/core/dist/services';
import { DynamicField, DynamicFieldType, DynamicFieldObject } from '@kix/core/dist/model/';
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

    public async getTicketNotesDynamicFieldId(token: string): Promise<number> {

        const query = {
            fields: 'DynamicField.ID',
            filter: '{"DynamicField": {"AND": [{"Field": "Name", "Operator": "EQ", "Value": "TicketNotes"}]}}'
        };

        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<DynamicFieldsResponse>(token, uri, query);

        let id;
        if (response.DynamicField.length) {
            id = response.DynamicField[0].ID;
        }

        return id;
    }

    public async getTicketDynamicFields(token: string): Promise<DynamicField[]> {

        const query = {
            fields: 'DynamicField.*',
            filter: '{"DynamicField": {"AND": [{"Field": "ObjectType", "Operator": "EQ", "Value": "Ticket"}]}}',
            include: 'Config'
        };

        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<DynamicFieldsResponse>(token, uri, query);
        return response.DynamicField;
    }
}
