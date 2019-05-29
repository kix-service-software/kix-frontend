import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";
import { UserPreference } from "./UserPreference";

export class UserPreferenceFactory implements IObjectFactory<UserPreference> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.USER_PREFERENCE;
    }

    public create(userPreference: UserPreference): UserPreference {
        return new UserPreference(userPreference);
    }

}
