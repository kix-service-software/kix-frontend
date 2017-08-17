import { UsersResponse, CreateUserRequest, CreateUserResponse } from './../model/';
import { IHttpService } from './IHttpService';
import { injectable, inject } from 'inversify';
import { User, SortOrder, UserQuery, UserResponse } from './../model/';
import { IUserService } from './IUserService';

@injectable()
export class UserService implements IUserService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getUsers(limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]> {
        const queryOptions = [];

        if (limit) {
            queryOptions.push(UserQuery.LIMIT + "=" + limit);
        }

        if (order) {
            queryOptions.push(UserQuery.ORDER + "=" + order);
        }

        if (changedAfter) {
            queryOptions.push(UserQuery.CHANGED_AFTER + "=" + changedAfter);
        }

        let uri = "users";
        if (queryOptions.length) {
            const query = queryOptions.join('&');
            uri += "?" + query;
        }

        const response = await this.httpService.get<UsersResponse>(uri);
        return response.User;
    }

    public async  getUser(id: number): Promise<User> {
        const response = await this.httpService.get<UserResponse>("users/" + id);
        return response.User;
    }

    public async createUser(
        login: string, title: string, firstName: string, lastName: string, fullName: string): Promise<number> {

        const user = new User();
        user.UserLogin = login;
        user.UserTitle = title;
        user.UserFirstname = firstName;
        user.UserLastname = lastName;
        user.UserFullname = fullName;

        const createUserRequest = new CreateUserRequest(user);

        const response = await this.httpService.post<CreateUserResponse>("users", createUserRequest);
        return response.UserID;
    }

}
