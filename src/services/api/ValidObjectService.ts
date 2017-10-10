import {
    IHttpService,
    IValidObjectService,
    ValidObject,
    ValidObjectResponse,
    ValidObjectsResponse,
    SortOrder,
    Query
} from '@kix/core';

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
