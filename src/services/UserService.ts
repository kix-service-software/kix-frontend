import { IHttpService } from './IHttpService';
import { injectable, inject } from 'inversify';
import { User, SortOrder } from './../model/';
import { IUserService } from './IUserService';

@injectable()
export class UserService implements IUserService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getUsers(limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]> {
        return [];
    }

    public async  getUser(id: number): Promise<User> {
        const response = await this.httpService.get("users/" + id);
        return new User();
    }

}
