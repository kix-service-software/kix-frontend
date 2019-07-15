import { User, KIXObjectType, UserProperty, PersonalSettingsProperty } from "../../model";
import { KIXObjectFormService } from "../kix/KIXObjectFormService";

export class UserFormService extends KIXObjectFormService<User> {

    private static INSTANCE: UserFormService = null;

    public static getInstance(): UserFormService {
        if (!UserFormService.INSTANCE) {
            UserFormService.INSTANCE = new UserFormService();
        }

        return UserFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.USER;
    }

    protected async getValue(property: string, value: any, user: User): Promise<any> {
        switch (property) {
            case UserProperty.ROLEIDS:
                if (!value) {
                    value = [];
                }
                break;
            case PersonalSettingsProperty.MY_QUEUES:
                if (user && user.Preferences) {
                    const myQueues = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
                    if (myQueues && myQueues.Value) {
                        value = myQueues.Value.split(',').map((v) => Number(v));
                    }
                }
                break;
            default:
        }
        return value;
    }

}
