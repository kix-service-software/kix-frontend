import { ObjectService } from './ObjectService';
import { IObjectIconService } from '@kix/core/dist/services';
import { ObjectIcon } from '@kix/core/dist/model';
import {
    ObjectIconResponse, ObjectIconsResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class ObjectIconService extends ObjectService<ObjectIcon> implements IObjectIconService {

    protected RESOURCE_URI: string = "objecticons";

    public async getObjectIcons(token: string, query?: any): Promise<ObjectIcon[]> {
        const response = await this.getObjects<ObjectIconsResponse>(token);
        return response.ObjectIcon;
    }

    public async getObjectIcon(
        token: string, objectType: string, objectId: number | string, query?: any
    ): Promise<ObjectIcon> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.httpService.get<ObjectIconResponse>(uri, {
            filter: {
                ObjectIcon: {
                    AND: [
                        { Field: "Object", Operator: "EQ", Value: objectType },
                        { Field: "ObjectID", Operator: "EQ", Value: objectId }
                    ]
                }
            }
        }, token);

        return response.ObjectIcon;
    }

}
