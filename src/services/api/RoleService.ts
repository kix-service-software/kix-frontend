import {
    CreateRole,
    CreateRoleRequest,
    CreateRoleResponse,
    RoleResponse,
    RolesResponse,
    UpdateRole,
    UpdateRoleRequest,
    UpdateRoleResponse,
    RoleAssignedUsersResponse
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

import { IRoleService } from '@kix/core/dist/services';
import { Role } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class RoleService extends ObjectService<Role> implements IRoleService {

    protected RESOURCE_URI: string = "roles";

    public async getRoles(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Role[]> {

        const response = await this.getObjects<RolesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Role;
    }

    public async getRole(token: string, roleId: number, query?: any): Promise<Role> {
        const response = await this.getObject<RoleResponse>(
            token, roleId
        );

        return response.Role;
    }

    public async createRole(token: string, name: string, comment: string, validId: number): Promise<number> {
        const response = await this.createObject<CreateRoleResponse, CreateRoleRequest>(
            token, this.RESOURCE_URI, new CreateRoleRequest(new CreateRole(name, comment, validId))
        );

        return response.RoleID;
    }

    public async updateRole(
        token: string, roleId: number, name: string, comment: string, validId: any
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId);
        const response = await this.updateObject<UpdateRoleResponse, UpdateRoleRequest>(
            token, uri, new UpdateRoleRequest(new UpdateRole(name, comment, validId))
        );

        return response.RoleID;
    }

    public async deleteRole(token: string, roleId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId);
        await this.deleteObject<void>(token, uri);
    }

    public async getAssignedUsers(token: string, roleId: number): Promise<number[]> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId, 'userids');

        const response = await this.httpService.get<RoleAssignedUsersResponse>(uri, {}, token);
        return response ? response.UserID : [];
    }

    public async assignUser(token: string, roleId: number, userId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId, 'userids');
        await this.httpService.post<void>(uri, { UserId: userId }, token);
    }

    public async removeAssignedUser(token: string, roleId: number, userId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId, 'userids', userId);
        await this.httpService.delete<void>(uri, token);
    }

}
