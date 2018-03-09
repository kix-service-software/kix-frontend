import {
    CreateUser,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUser,
    UpdateUserRequest,
    UpdateUserResponse,
    UsersResponse,
    UserAssignedRolesResponse,
    Query,
    UserResponse,
} from '@kix/core/dist/api';

import { IUserService } from '@kix/core/dist/services';
import { User } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class UserService extends ObjectService<User> implements IUserService {

    protected RESOURCE_URI: string = "users";
    private USER_RESOURCE_URI = "user";

    public async getUsers(token: string): Promise<User[]> {
        const query = { fields: 'User.UserLogin,User.UserID,User.UserFullname' };
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<UsersResponse>(token, uri, query);
        return response.User;
    }

    public async getUserByToken(token: string, query: any = {}): Promise<User> {
        if (!query) {
            query = {};
        }

        const response = await this.httpService.get<UserResponse>(this.USER_RESOURCE_URI, query, token);

        return response.User;
    }

}
