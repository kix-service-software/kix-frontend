import { ObjectFactory } from "./ObjectFactory";
import { FollowUpType, KIXObjectType } from "../../model";

export class FollowUpTypeFactory extends ObjectFactory<FollowUpType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public create(followUpType?: FollowUpType): FollowUpType {
        return new FollowUpType(followUpType);
    }


}
