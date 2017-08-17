import { User, SortOrder } from './../model/';

export interface IUserService {

    getUsers(limit?: number, order?: SortOrder, changedAfter?: string): Promise<User[]>;

    getUser(id: number): Promise<User>;

    createUser(login: string, title: string, firstName: string, lastName: string, fullName: string): Promise<number>;
}
