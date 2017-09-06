import { User, SortOrder } from './../model/';

export interface IUserService {

    getUsers(limit?: number, order?: SortOrder, changedAfter?: string, token?: string): Promise<User[]>;

    getUser(id: number, token?: string): Promise<User>;

    createUser(
        login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string
    ): Promise<number>;

    updateUser(
        userId: number, login: string, firstName: string, lastName: string,
        email: string, password: string, phone: string, title: string, valid: number
    ): Promise<number>;
}
