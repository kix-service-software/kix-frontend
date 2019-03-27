import { SetPreference } from './SetPreference';

export class SetPreferenceRequest {

    public UserPreference: SetPreference;

    public constructor(userPreference: SetPreference) {
        this.UserPreference = userPreference;
    }

}
