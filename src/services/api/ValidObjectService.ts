import { ValidObjectResponse, ValidObjectsResponse, Query } from '@kix/core/dist/api';
import { IValidObjectService } from '@kix/core/dist/services';
import { ValidObject, SortOrder } from '@kix/core/dist/model';


import { ObjectService } from './ObjectService';

export class ValidObjectService extends ObjectService<ValidObject> implements IValidObjectService {

    protected RESOURCE_URI: string = "valid";

    public async getValidObjects(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ValidObject[]> {
        const response = await this.getObjects<ValidObjectsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Valid;
    }

    public async getValidObject(token: string, validObjectId: number, query?: any): Promise<ValidObject> {
        const response = await this.getObject<ValidObjectResponse>(
            token, validObjectId
        );

        return response.Valid;
    }

}
