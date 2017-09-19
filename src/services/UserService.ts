import {
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UsersResponse,
    SortOrder,
    User,
    UserQuery,
    UserResponse,
    IUserService,
    IHttpService
} from '@kix/core';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService implements IUserService {

    private httpService: IHttpService;
    private USERS_RESOURCE_URI = "users";
    private USER_RESOURCE_URI = "user";

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getUsers(
        query: any = {}, limit?: number, order?: SortOrder, changedAfter?: string, token?: string): Promise<User[]> {

        if (!query) {
            query = {};
        }

        if (limit) {
            query[UserQuery.LIMIT] = limit;
        }

        if (order) {
            query[UserQuery.ORDER] = order;
        }

        if (changedAfter) {
            query[UserQuery.CHANGED_AFTER] = changedAfter;
        }

        const response = await this.httpService.get<UsersResponse>(this.USERS_RESOURCE_URI, query, token);

        return response.User;
    }

    public async  getUser(id: number, query: any = {}, token?: string): Promise<User> {
        if (!query) {
            query = {};
        }

        const response = await this.httpService.get<UserResponse>(this.USERS_RESOURCE_URI + "/" + id, query, token);

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
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string): Promise<number> {

        const createUserRequest = new CreateUserRequest(login, firstName, lastName, email, password, phone, title);

        const response = await this.httpService.post<CreateUserResponse>(this.USERS_RESOURCE_URI, createUserRequest);

        return response.UserID;
    }

    public async updateUser(
        userId: number, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number): Promise<number> {

        const updateUserRequest = new UpdateUserRequest(
            login, firstName, lastName, email, password, phone, title, valid);

        const response = await this.httpService
            .patch<UpdateUserResponse>(this.USERS_RESOURCE_URI + "/" + userId, updateUserRequest);

        return response.UserID;
    }

}
