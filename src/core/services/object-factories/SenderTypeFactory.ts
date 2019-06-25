import { ObjectFactory } from "./ObjectFactory";
import { SenderType, KIXObjectType } from "../../model";

export class SenderTypeFactory extends ObjectFactory<SenderType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SENDER_TYPE;
    }

    public create(senderType?: SenderType): SenderType {
        return new SenderType(senderType);
    }

}
