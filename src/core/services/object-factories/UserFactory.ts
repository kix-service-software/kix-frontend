import { ObjectFactory } from "./ObjectFactory";
import { User, KIXObjectType } from "../../model";

export class UserFactory extends ObjectFactory<User> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.USER;
    }

    public create(user: User): User {
        return new User(user);
    }

}
