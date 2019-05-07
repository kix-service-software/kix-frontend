import { RequestObject } from '../../RequestObject';
import { UserProperty } from '../../../model';

export class CreateUser extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super(parameter.filter((p) => p[0] !== UserProperty.USER_LANGUAGE));

        const userLanguage = parameter.find((p) => p[0] === UserProperty.USER_LANGUAGE);
        if (userLanguage) {
            const preferences = [
                {
                    ID: UserProperty.USER_LANGUAGE,
                    Value: userLanguage[1]
                }
            ];
            this.applyProperty(UserProperty.PREFERENCES, preferences);
        }
    }

}
