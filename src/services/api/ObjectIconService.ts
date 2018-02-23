import { ObjectService } from './ObjectService';
import { IObjectIconService } from '@kix/core/dist/services';
import { ObjectIcon, SortOrder } from '@kix/core/dist/model';
import {
    ObjectIconResponse, ObjectIconsResponse
} from '@kix/core/dist/api';

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
        const response = await this.httpService.get<ObjectIconsResponse>(uri, {
            filter: this.createFilter(objectType, objectId)
        }, token);

        return response.ObjectIcon && response.ObjectIcon.length ? response.ObjectIcon[0] : undefined;
    }

    private createFilter(objectType: string, objectId: number | string): string {
        const id = objectId ? objectId.toString() : '';
        const filter = {
            ObjectIcon: {
                AND: [
                    { Field: "Object", Operator: "EQ", Value: objectType },
                    { Field: "ObjectID", Operator: "EQ", Value: id }
                ]
            }
        };
        return JSON.stringify(filter);
    }

}
