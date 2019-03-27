import {
    CreateRole, CreateRoleResponse, CreateRoleRequest,
    UpdateRole, UpdateRoleResponse, UpdateRoleRequest,
    CreatePermission, CreatePermissionResponse, CreatePermissionRequest
} from '../../../api';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ObjectIcon, Error, RoleFactory, KIXObject
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { PermissionTypeFactory, CreatePermissionOptions } from '../../../model/kix/permission';

export class RoleService extends KIXObjectService {

    protected objectType: KIXObjectType = KIXObjectType.ROLE;

    private static INSTANCE: RoleService;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }
        return RoleService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'roles';
    protected SUB_RESOURCE_URI_PERMISSION: string = 'permissions';
    protected SUB_RESOURCE_URI_PERMISSION_TYPE: string = 'permissiontypes';

    public kixObjectType: KIXObjectType = KIXObjectType.ROLE;

    private constructor() {
        super([new RoleFactory(), new PermissionTypeFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ROLE
            || kixObjectType === KIXObjectType.PERMISSION
            || kixObjectType === KIXObjectType.PERMISSION_TYPE;
    }

    public async loadObjects<T extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.ROLE) {
            objects = await super.load(
                token, this.objectType, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.ROLE
            );
        } else if (objectType === KIXObjectType.PERMISSION_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, this.SUB_RESOURCE_URI_PERMISSION_TYPE);
            objects = await super.load(
                token, KIXObjectType.PERMISSION_TYPE, uri, loadingOptions, objectIds, KIXObjectType.PERMISSION_TYPE
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        let responseId;
        if (objectType === this.objectType) {
            const createRole = new CreateRole(parameter);

            const response = await this.sendCreateRequest<CreateRoleResponse, CreateRoleRequest>(
                token, clientRequestId, this.RESOURCE_URI, new CreateRoleRequest(createRole), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            responseId = response.RoleID;

            const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
            if (icon) {
                icon.Object = 'Role';
                icon.ObjectID = responseId;
                await this.createIcons(token, clientRequestId, icon);
            }
        } else if (objectType === KIXObjectType.PERMISSION) {
            responseId = await this.createPermission(
                token, clientRequestId, parameter, (createOptions as CreatePermissionOptions)
            );
        }

        return responseId;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateRole = new UpdateRole(parameter);

        const response = await this.sendUpdateRequest<UpdateRoleResponse, UpdateRoleRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateRoleRequest(updateRole),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.RoleID;
    }

    private async createPermission(
        token: string, clientRequestId: string,
        parameter: Array<[string, any]>,
        createOptions?: CreatePermissionOptions
    ): Promise<number> {
        let responseId;
        if (createOptions && createOptions.roleId) {
            const createPermission = new CreatePermission(parameter);

            const response = await this.sendCreateRequest<CreatePermissionResponse, CreatePermissionRequest>(
                token, clientRequestId,
                this.buildUri(this.RESOURCE_URI, createOptions.roleId, this.SUB_RESOURCE_URI_PERMISSION),
                new CreatePermissionRequest(createPermission), KIXObjectType.PERMISSION
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            responseId = response.PermissionID;
        }
        return responseId;
    }
}
