import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";
import { FollowUpType } from "./FollowUpType";

export class FollowUpTypeFactory implements IObjectFactory<FollowUpType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public create(followUpType?: FollowUpType): FollowUpType {
        return new FollowUpType(followUpType);
    }


}
