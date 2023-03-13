/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { Queue } from '../model/Queue';
import { FollowUpType } from '../model/FollowUpType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { CacheService } from '../../../server/services/cache';
import { QueueProperty } from '../model/QueueProperty';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { RoleProperty } from '../../user/model/RoleProperty';
import { Role } from '../../user/model/Role';
import { RoleService } from '../../user/server/RoleService';
import { CreatePermissionDescription } from '../../user/server/CreatePermissionDescription';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class QueueAPIService extends KIXObjectAPIService {

    private static INSTANCE: QueueAPIService;

    public static getInstance(): QueueAPIService {
        if (!QueueAPIService.INSTANCE) {
            QueueAPIService.INSTANCE = new QueueAPIService();
        }
        return QueueAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'ticket', 'queues');

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
        CacheService.getInstance().addDependencies(KIXObjectType.TICKET, ['QUEUE_HIERARCHY']);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    protected getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.QUEUE) {
            objectClass = Queue;
        }
        return objectClass;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.QUEUE) {
            const uri = this.buildUri(this.RESOURCE_URI);
            objectResponse = await super.load<Queue>(
                token, KIXObjectType.QUEUE, uri, loadingOptions, null, KIXObjectType.QUEUE, clientRequestId, Queue
            ).catch((e): ObjectResponse<Queue> => {
                return new ObjectResponse();
            });

            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (t: Queue) => objectIds.some((oid) => oid === t.QueueID)
                );
            }
        } else if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'followuptypes');
            objectResponse = await super.load<FollowUpType>(
                token, KIXObjectType.FOLLOW_UP_TYPE, uri, loadingOptions, null, KIXObjectType.FOLLOW_UP_TYPE,
                clientRequestId, FollowUpType
            );
            if (objectIds && objectIds.length) {
                objectResponse.objects = objectResponse?.objects?.filter(
                    (f: FollowUpType) => objectIds.some((oid) => oid.toString() === f.ObjectId.toString())
                );
            }
        }
        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const queueParameter = parameter.filter((p) => p[0] !== QueueProperty.PERMISSIONS);
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, queueParameter, this.RESOURCE_URI, this.objectType, 'QueueID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const permissionParameter = parameter.find((p) => p[0] === QueueProperty.PERMISSIONS);
        if (permissionParameter) {
            await this.updatePermissions(id, permissionParameter[1]).catch(() => null);
        }

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, uri, this.objectType, 'QueueID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const permissionParameter = parameter.find((p) => p[0] === QueueProperty.PERMISSIONS);
        if (permissionParameter) {
            await this.updatePermissions(id, permissionParameter[1]).catch(() => null);
        }
        return id;
    }

    private async updatePermissions(queueId: number, permissions: CreatePermissionDescription[] = []): Promise<void> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const token = config.BACKEND_API_TOKEN;

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [RoleProperty.PERMISSIONS]);
        const objectResponse = await RoleService.getInstance().loadObjects<Role>(
            token, 'QueueAPIService', KIXObjectType.ROLE, null, loadingOptions, null
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            return new ObjectResponse<Role>();
        });
        const roles = objectResponse?.objects || [];

        const permissionTypeIds = await RoleService.getInstance().getPermissionTypeId('Base', token, true);
        const permissionTypeId = permissionTypeIds?.length ? permissionTypeIds[0] : null;
        const target = queueId?.toString();

        // cleanup roles
        for (const role of roles) {

            const permission = role.Permissions?.find(
                (p) => p.TypeID === permissionTypeId && p.Target === target
            );

            if (permission) {
                await RoleService.getInstance().deletePermission(
                    token, 'TemplateAPIService', role.ID, permission.ID
                ).catch((error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                });
            }
        }

        for (const permission of permissions) {
            permission.Target = queueId?.toString();
            permission.TypeID = permissionTypeId;
            await RoleService.getInstance().createPermissions(
                token, 'TemplateAPIService', permission.RoleID, [], [permission]
            );
        }
    }

}
