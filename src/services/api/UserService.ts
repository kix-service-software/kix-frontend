import {
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UsersResponse,
    SortOrder,
    Query,
    UserResponse,
} from '@kix/core/dist/api';

import { IUserService } from '@kix/core/dist/services';
import { User } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class UserService extends ObjectService<User> implements IUserService {

    protected RESOURCE_URI: string = "users";
    private USER_RESOURCE_URI = "user";

    public async getUsers(
        token: string, query: any = {}, limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]> {

        const response = await this.getObjects<UsersResponse>(
            token, limit, order, changedAfter, query
        );

        return response.User;
    }

    public async  getUser(token: string, userId: number, query: any = {}): Promise<User> {
        const response = await this.getObject<UserResponse>(
            token, userId
        );

        return response.User;
    }

    public async getUserByToken(token: string, query: any = {}): Promise<User> {
        if (!query) {
            query = {};
        }

        const response = await this.httpService.get<UserResponse>(this.USER_RESOURCE_URI, query, token);

        return response.User;
    }

    public async createUser(
        token: string, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string): Promise<number> {

        const createUserRequest = new CreateUserRequest(login, firstName, lastName, email, password, phone, title);

        const response = await this.createObject<CreateUserResponse, CreateUserRequest>(
            token, this.RESOURCE_URI, createUserRequest
        );

        return response.UserID;
    }

    public async updateUser(
        token: string, userId: number, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number): Promise<number> {

        const updateUserRequest = new UpdateUserRequest(
            login, firstName, lastName, email, password, phone, title, valid);

        const uri = this.buildUri(this.RESOURCE_URI, userId);
        const response = await this.updateObject<UpdateUserResponse, UpdateUserRequest>(
            token, uri, updateUserRequest
        );

        return response.UserID;
    }

}
