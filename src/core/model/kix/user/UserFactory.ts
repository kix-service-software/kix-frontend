import { User } from "./User";
import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";

export class UserFactory implements IObjectFactory<User> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.USER;
    }

    public create(user: User): User {
        return new User(user);
    }

}
