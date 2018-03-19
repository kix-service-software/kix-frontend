import { ObjectService } from './ObjectService';
import { IObjectIconService } from '@kix/core/dist/services';
import { ObjectIcon, SortOrder } from '@kix/core/dist/model';
import {
    ObjectIconResponse, ObjectIconsResponse
} from '@kix/core/dist/api';

export class ObjectIconService extends ObjectService<ObjectIcon> implements IObjectIconService {

    protected RESOURCE_URI: string = "objecticons";

    private iconCache: ObjectIcon[] = [];

    public async initIcons(token: string): Promise<void> {
        const uri = this.buildUri('objecticons');
        const response = await this.getObjectByUri<ObjectIconsResponse>(token, uri);
        this.iconCache = response.ObjectIcon;
    }

    public async getObjectIcon(
        token: string, objectType: string, objectId: number | string
    ): Promise<ObjectIcon> {
        if (!this.iconCache || !this.iconCache.length) {
            await this.initIcons(token);
        }

        let icon = this.getIconFromCache(objectType, objectId.toString());
        if (!icon) {
            icon = await this.loadIcon(token, objectType, objectId);
        }
        return icon;
    }

    private getIconFromCache(object: string, objectId: string): ObjectIcon {
        return this.iconCache.find((oi) => oi.Object === object && oi.ObjectID === objectId);
    }

    private async loadIcon(token: string, object: string, objectId: string | number): Promise<ObjectIcon> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.httpService.get<ObjectIconsResponse>(uri, {
            filter: this.createFilter(object, objectId)
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
