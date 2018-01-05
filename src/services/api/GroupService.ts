import { ObjectService } from './ObjectService';
import { IGroupService } from '@kix/core/dist/services';
import { Group } from '@kix/core/dist/model';
import {
    CreateGroup,
    CreateGroupResponse,
    CreateGroupRequest,
    GroupsResponse,
    GroupResponse,
    UpdateGroupResponse,
    UpdateGroupRequest
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class GroupService extends ObjectService<Group> implements IGroupService {

    protected RESOURCE_URI: string = "groups";

    public async getGroups(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Group[]> {

        const response = await this.getObjects<GroupsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Group;
    }

    public async getGroup(token: string, groupId: number, query?: any): Promise<Group> {
        const response = await this.getObject<GroupResponse>(
            token, groupId
        );

        return response.Group;
    }

    public async createGroup(token: string, name: string, comment: string, validId: number): Promise<number> {
        const response = await this.createObject<CreateGroupResponse, CreateGroupRequest>(
            token, this.RESOURCE_URI, new CreateGroupRequest(new CreateGroup(name, comment, validId))
        );

        return response.GroupID;
    }

    public async updateGroup(
        token: string, groupId: number, name: string, comment: string, validId: any
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, groupId);
        const response = await this.updateObject<UpdateGroupResponse, UpdateGroupRequest>(
            token, uri, new UpdateGroupRequest(name, comment, validId)
        );

        return response.GroupID;
    }

    public async deleteGroup(token: string, groupId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, groupId);
        await this.deleteObject<void>(token, uri);
    }

}
