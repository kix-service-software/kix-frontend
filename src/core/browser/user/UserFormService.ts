import { User, KIXObjectType, UserProperty } from "../../model";
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
        if (value) {
            switch (property) {
                case UserProperty.ROLEIDS:
                    if (!value) {
                        value = [];
                    }
                    break;
                default:
            }
        }
        return value;
    }
}
