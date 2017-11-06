import {
    CreateRole,
    CreateRoleRequest,
    CreateRoleResponse,
    IRoleService,
    Role,
    RoleResponse,
    RolesResponse,
    SortOrder,
    UpdateRoleRequest,
    UpdateRoleResponse,
} from '@kix/core';

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
            token, uri, new UpdateRoleRequest(name, comment, validId)
        );

        return response.RoleID;
    }

    public async deleteRole(token: string, roleId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, roleId);
        await this.deleteObject<void>(token, uri);
    }

}
