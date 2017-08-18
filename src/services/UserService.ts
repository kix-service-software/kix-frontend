import {
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UsersResponse
} from './../model/';
import { IHttpService } from './IHttpService';
import { inject, injectable } from 'inversify';
import { IUserService } from './IUserService';
import {
    SortOrder,
    User,
    UserQuery,
    UserResponse
} from './../model/';

@injectable()
export class UserService implements IUserService {

    private httpService: IHttpService;

    private RESOURCE_URI = "users";

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getUsers(limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]> {
        const queryParameters = {};

        if (limit) {
            queryParameters[UserQuery.LIMIT] = limit;
        }

        if (order) {
            queryParameters[UserQuery.ORDER] = order;
        }

        if (changedAfter) {
            queryParameters[UserQuery.CHANGED_AFTER] = changedAfter;
        }

        const response = await this.httpService.get<UsersResponse>(this.RESOURCE_URI, queryParameters);

        return response.User;
    }

    public async  getUser(id: number): Promise<User> {
        const response = await this.httpService.get<UserResponse>(this.RESOURCE_URI + "/" + id);

        return response.User;
    }

    public async createUser(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string): Promise<number> {

        const createUserRequest = new CreateUserRequest(login, firstName, lastName, email, password, phone, title);

        const response = await this.httpService.post<CreateUserResponse>(this.RESOURCE_URI, createUserRequest);

        return response.UserID;
    }

    public async updateUser(
        userId: number, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number): Promise<number> {

        const updateUserRequest = new UpdateUserRequest(
            login, firstName, lastName, email, password, phone, title, valid);

        const response = await this.httpService
            .patch<UpdateUserResponse>(this.RESOURCE_URI + "/" + userId, updateUserRequest);

        return response.UserID;
    }

}
