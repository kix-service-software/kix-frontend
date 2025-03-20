/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { RoleProperty } from '../model/RoleProperty';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { PermissionProperty } from '../model/PermissionProperty';
import { CreatePermissionDescription } from './CreatePermissionDescription';
import { Permission } from '../model/Permission';
import { Role } from '../model/Role';
import { PermissionType } from '../model/PermissionType';
import { Error } from '../../../../../server/model/Error';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { SearchOperator } from '../../search/model/SearchOperator';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { SysConfigOptionProperty } from '../../sysconfig/model/SysConfigOptionProperty';
import { AgentPortalConfiguration } from '../../../model/configuration/AgentPortalConfiguration';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';


export class RoleService extends KIXObjectAPIService {

    protected objectType: KIXObjectType = KIXObjectType.ROLE;

    private static INSTANCE: RoleService;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }
        return RoleService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'roles');

    public kixObjectType: KIXObjectType = KIXObjectType.ROLE;

    private constructor() {
        super();
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
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.ROLE) {
            objectResponse = await super.load(
                token, this.objectType, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.ROLE,
                clientRequestId, Role
            );
        } else if (objectType === KIXObjectType.PERMISSION_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'permissiontypes');
            objectResponse = await super.load(
                token, KIXObjectType.PERMISSION_TYPE, uri, loadingOptions, objectIds, KIXObjectType.PERMISSION_TYPE,
                clientRequestId, PermissionType
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createParameter = parameter.filter(
            (p) => p[0] !== RoleProperty.PERMISSIONS && p[0] !== RoleProperty.ALLOW_ADMIN_MODULE
        );

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, createParameter, this.RESOURCE_URI, this.objectType, 'RoleID', true
        );

        const permissions = this.getParameterValue(parameter, RoleProperty.PERMISSIONS);
        await this.createPermissions(token, clientRequestId, Number(id), [], permissions);

        const allowAdminModule = this.getParameterValue(parameter, RoleProperty.ALLOW_ADMIN_MODULE);
        await this.applyAllowAdminModule(id, !allowAdminModule);

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateParameter = parameter.filter(
            (p) => p[0] !== RoleProperty.USER_IDS
                && p[0] !== RoleProperty.PERMISSIONS
                && p[0] !== RoleProperty.ALLOW_ADMIN_MODULE
        );

        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, updateParameter, uri, this.objectType, 'RoleID'
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [RoleProperty.USER_IDS, RoleProperty.PERMISSIONS]
        );
        const objectResponse = await super.load<Role>(
            token, this.objectType, this.RESOURCE_URI, loadingOptions, [id], KIXObjectType.ROLE,
            clientRequestId, Role
        ).catch((): ObjectResponse<Role> => new ObjectResponse());

        if (objectResponse?.objects?.length) {
            const role = objectResponse.objects[0];
            const userIds = this.getParameterValue(parameter, RoleProperty.USER_IDS);
            const permissions = this.getParameterValue(parameter, RoleProperty.PERMISSIONS);

            await Promise.all([
                this.setUserIds(token, clientRequestId, Number(id), role.UserIDs, userIds),
                this.setPermissions(token, clientRequestId, Number(id), role.Permissions, permissions)
            ]);
        }

        const allowAdminModule = this.getParameterValue(parameter, RoleProperty.ALLOW_ADMIN_MODULE);
        await this.applyAllowAdminModule(id, !allowAdminModule);

        return id;
    }

    private async applyAllowAdminModule(roleId: number, remove?: boolean): Promise<void> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const token = config.BACKEND_API_TOKEN;
        const agentPortalConfig = await SysConfigService.getInstance().getPortalConfiguration(token);
        if (!Array.isArray(agentPortalConfig?.adminRoleIds)) {
            agentPortalConfig.adminRoleIds = [];
        }

        if (!remove && !agentPortalConfig.adminRoleIds.some((rid) => rid === roleId)) {
            agentPortalConfig.adminRoleIds.push(roleId);
        } else if (remove) {
            const index = agentPortalConfig.adminRoleIds?.findIndex((rid) => rid === roleId);
            if (index !== -1) {
                agentPortalConfig.adminRoleIds.splice(index, 1);
            }
        }

        await SysConfigService.getInstance().updateObject(
            token, 'RoleService', KIXObjectType.SYS_CONFIG_OPTION,
            [[SysConfigOptionProperty.VALUE, JSON.stringify(agentPortalConfig)]],
            AgentPortalConfiguration.CONFIGURATION_ID
        );
    }

    private async setUserIds(
        token: string, clientRequestId: string, roleId: number, existingUserIds: number[] = [], userIds: number[] = []
    ): Promise<void> {
        if (!userIds) {
            userIds = [];
        }
        const baseUri = this.buildUri(this.RESOURCE_URI, roleId, 'userids');

        await Promise.all([
            this.deleteUserIds(token, clientRequestId, baseUri, existingUserIds, userIds),
            this.createUserIds(token, clientRequestId, baseUri, existingUserIds, userIds)
        ]);
    }

    private async deleteUserIds(
        token: string, clientRequestId: string, baseUri: string, existingUserIds: number[], userIds: number[]
    ): Promise<void> {
        const userIdsToRemove = existingUserIds.filter((euid) => !userIds.some((uid) => uid === euid));
        if (userIdsToRemove.length) {
            const deleteUris = userIdsToRemove.map((userId) => this.buildUri(baseUri, userId));
            const errors: Error[] = await this.sendDeleteRequest<Error>(
                token, clientRequestId, deleteUris, KIXObjectType.ROLE
            ).catch((error) => [error]);
            errors.forEach((e) => LoggingService.getInstance().error(`${e.Code}: ${e.Message}`, e));
        }
    }

    private async createUserIds(
        token: string, clientRequestId: string, baseUri: string, existingUserIds: number[], userIds: number[]
    ): Promise<void> {
        const userIdsToAdd = userIds.filter((uid) => !existingUserIds.some((euid) => euid === uid));
        const createPromises = [];
        userIdsToAdd.forEach((UserID) => createPromises.push(
            this.sendCreateRequest(token, clientRequestId, baseUri, { UserID }, KIXObjectType.ROLE).catch(
                (error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error)
            )
        ));
        await Promise.all(createPromises);
    }

    public async setPermissions(
        token: string, clientRequestId: string, roleId: number,
        existingPermissions: Permission[] = [], permissionDescs: CreatePermissionDescription[] = [],
        alsoDelete: boolean = true
    ): Promise<void> {
        if (!permissionDescs) {
            permissionDescs = [];
        }

        if (roleId) {
            const promises = [
                this.createPermissions(
                    token, clientRequestId, roleId, existingPermissions, permissionDescs
                ),
                this.updatePermissions(
                    token, clientRequestId, roleId, existingPermissions, permissionDescs
                )
            ];

            if (alsoDelete) {
                promises.push(this.deletePermissions(
                    token, clientRequestId, roleId, existingPermissions, permissionDescs
                ));
            }

            await Promise.all(promises);
        }
    }

    private async deletePermissions(
        token: string, clientRequestId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[]
    ): Promise<void> {
        const permissionIdsToRemove = existingPermissions.filter(
            (ep) => !permissionDescs.some(
                (pd) => ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
            )
        ).map((ep) => ep.ID);

        const deleteUris = permissionIdsToRemove.map(
            (permissionId) => this.buildUri(this.RESOURCE_URI, roleId, 'permissions', permissionId)
        );

        const errors: Error[] = await this.sendDeleteRequest(
            token, clientRequestId, deleteUris, KIXObjectType.PERMISSION
        ).catch((error) => [error]);
        errors.forEach((e) => LoggingService.getInstance().error(`${e.Code}: ${e.Message}`, e));
    }

    public async createPermissions(
        token: string, clientRequestId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[] = []
    ): Promise<void> {
        const permissionsToAdd = permissionDescs
            .filter((pd) => {
                return !existingPermissions.some(
                    (ep) => ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
                );
            });

        const requestPromises = [];
        const uri = this.buildUri(this.RESOURCE_URI, roleId, 'permissions');
        permissionsToAdd.forEach(
            (permissionDesc) => requestPromises.push(
                super.executeUpdateOrCreateRequest(
                    token, clientRequestId, this.getPermissionParameter(permissionDesc), uri,
                    KIXObjectType.PERMISSION, 'Permission', true
                ).catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error))
            )
        );
        await Promise.all(requestPromises);
    }

    public async updatePermissions(
        token: string, clientRequestId: string, roleId: number,
        existingPermissions: Permission[], permissionDescs: CreatePermissionDescription[]
    ): Promise<void> {

        // use permssions which already exists but have another value or comment
        const permissionsToPatch = permissionDescs.filter((pd) =>
            existingPermissions.some((ep) => {
                if (
                    ep.RoleID === roleId && ep.Target === pd.Target && ep.TypeID === pd.TypeID
                    && (ep.Value !== pd.Value || ep.Comment !== pd.Comment)
                ) {
                    pd.ID = ep.ID;
                    return true;
                } else {
                    return false;
                }
            })
        );

        const requestPromises = [];
        permissionsToPatch.forEach((permissionDesc) => {
            const uri = this.buildUri(this.RESOURCE_URI, roleId, 'permissions', permissionDesc.ID);
            requestPromises.push(
                super.executeUpdateOrCreateRequest(
                    token, clientRequestId, this.getPermissionParameter(permissionDesc), uri,
                    KIXObjectType.PERMISSION, 'Permission'
                ).catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error))
            );
        });
        await Promise.all(requestPromises);
    }

    private getPermissionParameter(permissionDesc: CreatePermissionDescription): Array<[string, any]> {
        const parameter: Array<[string, any]> = [
            [PermissionProperty.TYPE_ID, permissionDesc.TypeID],
            [PermissionProperty.TARGET, permissionDesc.Target],
            [PermissionProperty.VALUE, permissionDesc.Value],
            [PermissionProperty.COMMENT, permissionDesc.Comment],
            [PermissionProperty.IS_REQUIRED, permissionDesc.IsRequired]
        ];
        return parameter;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return [];
    }

    public async deletePermission(
        token: string, clientRequestId: string, roleId: number, permissionId: number
    ): Promise<void> {
        const deleteUri = this.buildUri(this.RESOURCE_URI, roleId, 'permissions', permissionId);

        const errors: Error[] = await this.sendDeleteRequest(
            token, clientRequestId, [deleteUri], KIXObjectType.PERMISSION
        ).catch((error) => [error]);

        if (errors && errors.length) {
            throw new Error(errors[0].Code, errors[0].Message, errors[0].StatusCode);
        }
    }

    public async getPermissionTypeId(name: string, token: string, useContains?: boolean): Promise<number[]> {
        const searchOperator = useContains ? SearchOperator.CONTAINS : SearchOperator.EQUALS;

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Name', searchOperator, FilterDataType.STRING, FilterType.AND, name)
        ]);
        const objectResponse = await this.loadObjects<PermissionType>(
            token, 'RoleService', KIXObjectType.PERMISSION_TYPE, null, loadingOptions, null
        ).catch((error): ObjectResponse<PermissionType> => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            return new ObjectResponse();
        });

        const permissionTypes = objectResponse?.objects || [];

        return permissionTypes?.length ? permissionTypes.map((pd) => pd.ID) : [];
    }

}
