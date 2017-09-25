import {
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UsersResponse,
    SortOrder,
    User,
    Query,
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
        token: string, query: any = {}, limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]> {

        if (!query) {
            query = {};
        }

        if (limit) {
            query[Query.LIMIT] = limit;
        }

        if (order) {
            query[Query.ORDER] = order;
        }

        if (changedAfter) {
            query[Query.CHANGED_AFTER] = changedAfter;
        }

        const response = await this.httpService.get<UsersResponse>(this.USERS_RESOURCE_URI, query, token);

        return response.User;
    }

    public async  getUser(token: string, id: number, query: any = {}): Promise<User> {
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
        token: string, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string): Promise<number> {

        const createUserRequest = new CreateUserRequest(login, firstName, lastName, email, password, phone, title);

        const response = await this.httpService.post<CreateUserResponse>(
            this.USERS_RESOURCE_URI, createUserRequest, token
        );

        return response.UserID;
    }

    public async updateUser(
        token: string, userId: number, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number): Promise<number> {

        const updateUserRequest = new UpdateUserRequest(
            login, firstName, lastName, email, password, phone, title, valid);

        const response = await this.httpService.patch<UpdateUserResponse>(
            this.USERS_RESOURCE_URI + "/" + userId, updateUserRequest, token
        );

        return response.UserID;
    }

}
