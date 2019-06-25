import { ObjectFactory } from "./ObjectFactory";
import { User } from "../../model/kix/user/User";
import { KIXObjectType } from "../../model/kix/KIXObjectType";

export class UserFactory extends ObjectFactory<User> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.USER;
    }

    public create(user: User): User {
        return new User(user);
    }

}
