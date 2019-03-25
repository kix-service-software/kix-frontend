import { User } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class UserBrowserFactory implements IKIXObjectFactory<User> {

    private static INSTANCE: UserBrowserFactory;

    public static getInstance(): UserBrowserFactory {
        if (!UserBrowserFactory.INSTANCE) {
            UserBrowserFactory.INSTANCE = new UserBrowserFactory();
        }
        return UserBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(user: User): Promise<User> {
        const newUser = new User(user);
        return newUser;
    }

}
