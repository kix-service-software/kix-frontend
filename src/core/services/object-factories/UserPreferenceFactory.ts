import { ObjectFactory } from "./ObjectFactory";
import { UserPreference, KIXObjectType } from "../../model";

export class UserPreferenceFactory extends ObjectFactory<UserPreference> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.USER_PREFERENCE;
    }

    public create(userPreference: UserPreference): UserPreference {
        return new UserPreference(userPreference);
    }

}
