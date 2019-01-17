import { UsersResponse, UserResponse, } from '../../../api';
import { User, KIXObjectType, Error } from '../../../model';
import { KIXObjectService } from './KIXObjectService';

export class UserService extends KIXObjectService {

    private static INSTANCE: UserService;

    public static getInstance(): UserService {
        if (!UserService.INSTANCE) {
            UserService.INSTANCE = new UserService();
        }
        return UserService.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected RESOURCE_URI: string = "users";
    private USER_RESOURCE_URI = "user";

    public kixObjectType: KIXObjectType = KIXObjectType.USER;

    private cache: Map<string, User> = new Map();

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.USER;
    }

    public async getUsers(token: string): Promise<User[]> {
        const query = { fields: 'User.UserLogin,User.UserID,User.UserFullname' };
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<UsersResponse>(token, uri, query);
        return response.User;
    }

    public async getUserByToken(token: string): Promise<User> {
        if (this.cache.has(token)) {
            return this.cache.get(token);
        }

        const query = {
            include: 'Tickets'
        };

        const response = await this.httpService.get<UserResponse>(this.USER_RESOURCE_URI, query, token);

        this.cache.set(token, response.User);

        return response.User;
    }

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
