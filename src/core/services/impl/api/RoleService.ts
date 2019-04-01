import {
    CreateRole, CreateRoleResponse, CreateRoleRequest,
    UpdateRole, UpdateRoleResponse, UpdateRoleRequest,
    PermissionRequestObject, CUPermissionRequest, CUPermissionResponse
} from '../../../api';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ObjectIcon, Error, RoleFactory, KIXObject, RoleProperty
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import {
    PermissionTypeFactory, CreatePermissionOptions,
    CreatePermissionDescription, PermissionProperty, Permission
} from '../../../model/kix/permission';

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
    protected SUB_RESOURCE_URI_USER_IDS: string = 'userids';

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
        }

        return responseId;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateParameter = parameter.filter(
            (p) => p[0] !== RoleProperty.USER_IDS
                && p[0] !== RoleProperty.PERMISSIONS
        );
        const updateRole = new UpdateRole(updateParameter);

        const response = await this.sendUpdateRequest<UpdateRoleResponse, UpdateRoleRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateRoleRequest(updateRole),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const userIds = this.getParameterValue(parameter, RoleProperty.USER_IDS);
        await this.setUserIds(token, clientRequestId, Number(objectId), userIds);

        const permissions = this.getParameterValue(parameter, RoleProperty.PERMISSIONS);
        await this.setPermissions(token, clientRequestId, Number(objectId), permissions);

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.RoleID;
    }

    private async setUserIds(
        token: string, clientReqeustId: string, roleId: number, userIds: number[] = []
    ): Promise<void> {
        if (!userIds) {
            userIds = [];
        }
        const baseUri = this.buildUri(this.RESOURCE_URI, roleId, this.SUB_RESOURCE_URI_USER_IDS);
        const existingUserIds = await this.load(token, null, baseUri, null, null, RoleProperty.USER_IDS);

        const userIdsToRemove = existingUserIds.filter((euid) => !userIds.some((uid) => uid === euid));
        const userIdsToAdd = userIds.filter((uid) => !existingUserIds.some((euid) => euid === uid));

        for (const userId of userIdsToRemove) {
            const deleteUri = this.buildUri(baseUri, userId);
            await this.sendDeleteRequest(token, clientReqeustId, deleteUri, KIXObjectType.ROLE)
                .catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }

        for (const userId of userIdsToAdd) {
            await this.sendCreateRequest(token, clientReqeustId, baseUri, { UserID: userId }, KIXObjectType.ROLE)
                .catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }
    }

    public async setPermissions(
        token: string, clientReqeustId: string, roleId: number, permissionDescs: CreatePermissionDescription[] = [],
        alsoDelete: boolean = true, loadingOptionsForExistingPermissions: KIXObjectLoadingOptions = null
    ): Promise<void> {
        if (!permissionDescs) {
            permissionDescs = [];
        }
        if (roleId) {
            const baseUri = this.buildUri(this.RESOURCE_URI, roleId, this.SUB_RESOURCE_URI_PERMISSION);
            const existingPermissions = await this.load<Permission>(
                token, null, baseUri, loadingOptionsForExistingPermissions, null, 'Permission'
            );

            if (alsoDelete) {
                await this.deletePermissions(
                    token, clientReqeustId, roleId, existingPermissions, permissionDescs
                );
            }
            await this.createPermissions(
                token, clientReqeustId, roleId, existingPermissions, permissionDescs
            );
            await this.updatePermissions(
                token, clientReqeustId, roleId, existingPermissions, permissionDescs
            );
        }
    }

    private async deletePermissions(
        token: string, clientReqeustId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[]
    ): Promise<void> {
        const permissionIdsToRemove = existingPermissions.filter(
            (ep) => !permissionDescs.some(
                (pd) => ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
            )
        ).map((ep) => ep.ID);

        for (const permissionId of permissionIdsToRemove) {
            await this.sendDeleteRequest(
                token, clientReqeustId,
                this.buildUri(this.RESOURCE_URI, roleId, this.SUB_RESOURCE_URI_PERMISSION, permissionId),
                KIXObjectType.PERMISSION
            ).catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }
    }

    private async createPermissions(
        token: string, clientReqeustId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[]
    ): Promise<void> {
        const permissionsToAdd = permissionDescs.filter(
            (pd) => !existingPermissions.some(
                (ep) => ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
            )
        );

        for (const permissionDesc of permissionsToAdd) {
            await this.sendCreateRequest<CUPermissionResponse, CUPermissionRequest>(
                token, clientReqeustId,
                this.buildUri(this.RESOURCE_URI, roleId, this.SUB_RESOURCE_URI_PERMISSION),
                this.getPermissionRequest(permissionDesc), KIXObjectType.PERMISSION
            ).catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }
    }

    private async updatePermissions(
        token: string, clientReqeustId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[]
    ): Promise<void> {
        const permissionsToPatch = permissionDescs.filter((pd) => {
            const existingPermission = existingPermissions.find(
                (ep) => ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
            );
            if (existingPermission) {
                pd.ID = existingPermission.ID;
                return true;
            } else {
                return false;
            }
        });

        for (const permissionDesc of permissionsToPatch) {
            await this.sendUpdateRequest<CUPermissionResponse, CUPermissionRequest>(
                token, clientReqeustId,
                this.buildUri(this.RESOURCE_URI, roleId, this.SUB_RESOURCE_URI_PERMISSION, permissionDesc.ID),
                this.getPermissionRequest(permissionDesc), KIXObjectType.PERMISSION
            ).catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }
    }

    private getPermissionRequest(permissionDesc: CreatePermissionDescription): CUPermissionRequest {
        const parameter: Array<[string, any]> = [
            [PermissionProperty.TYPE_ID, permissionDesc.TypeID],
            [PermissionProperty.TARGET, permissionDesc.Target],
            [PermissionProperty.VALUE, permissionDesc.Value],
            [PermissionProperty.COMMENT, permissionDesc.Comment],
            [PermissionProperty.IS_REQUIRED, permissionDesc.IsRequired]
        ];
        return new CUPermissionRequest(new PermissionRequestObject(parameter));
    }
}
