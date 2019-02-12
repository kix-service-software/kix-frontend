import { RequestObject } from '../RequestObject';

export class CreateSearchProfile extends RequestObject {

    public constructor(
        type: string,
        name: string,
        userLogin: string,
        userType: string,
        subscribedProfileId: number = null,
        data: any = null,
        categories: string[] = null
    ) {
        super();
        this.applyProperty("Type", type);
        this.applyProperty("Name", name);
        this.applyProperty("UserLogin", userLogin);
        this.applyProperty("UserType", userType);
        this.applyProperty("SubscribedProfileID", subscribedProfileId);
        this.applyProperty("Data", data);
        this.applyProperty("Categories", categories);
    }

}
