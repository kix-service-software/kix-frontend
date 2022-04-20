/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { ObjectIconLoadingOptions } from '../../../server/model/ObjectIconLoadingOptions';
import { ObjectIcon } from '../model/ObjectIcon';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { CreateObjectIcon } from './CreateObjectIcon';
import { CreateObjectIconResponse } from './CreateObjectIconResponse';
import { CreateObjectIconRequest } from './CreateObjectIconRequest';
import { UpdateObjectIcon } from './UpdateObjectIcon';
import { UpdateObjectIconResponse } from './UpdateObjectIconResponse';
import { UpdateObjectIconRequest } from './UpdateObjectIconRequest';
import { Error } from '../../../../../server/model/Error';

export class ObjectIconService extends KIXObjectAPIService {

    private static INSTANCE: ObjectIconService;

    public static getInstance(): ObjectIconService {
        if (!ObjectIconService.INSTANCE) {
            ObjectIconService.INSTANCE = new ObjectIconService();
        }
        return ObjectIconService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'objecticons');

    public objectType: KIXObjectType | string = KIXObjectType.OBJECT_ICON;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, iconLoadingOptions: ObjectIconLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.OBJECT_ICON) {
            const objectIcons = await this.getObjectIcons(token);
            if (objectIds && objectIds.length) {
                objects = objectIcons.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else if (iconLoadingOptions) {
                if (iconLoadingOptions.object && iconLoadingOptions.objectId) {
                    const icon = objectIcons.find(
                        (oi) => oi.Object === iconLoadingOptions.object
                            && oi.ObjectID.toString() === iconLoadingOptions.objectId.toString()
                    );
                    if (icon) {
                        objects = [icon];
                    }
                }
            } else {
                objects = objectIcons;
            }
        }

        return objects;
    }

    public async getObjectIcons(token: string): Promise<ObjectIcon[]> {
        return await super.load<ObjectIcon>(
            token, KIXObjectType.OBJECT_ICON, this.RESOURCE_URI, null, null, 'ObjectIcon', ObjectIcon
        );
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>
    ): Promise<string | number> {

        const createObjectIcon = new CreateObjectIcon(parameter);
        const response = await this.sendCreateRequest<CreateObjectIconResponse, CreateObjectIconRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateObjectIconRequest(createObjectIcon), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ObjectIconID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateObjectIcon = new UpdateObjectIcon(parameter);

        const response = await this.sendUpdateRequest<UpdateObjectIconResponse, UpdateObjectIconRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateObjectIconRequest(updateObjectIcon), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ObjectIconID;
    }
}
