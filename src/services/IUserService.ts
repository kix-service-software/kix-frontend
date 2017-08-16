import { User, SortOrder } from './../model/';

export interface IUserService {

    getUsers(limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]>;

    getUser(id: number): Promise<User>;

}
