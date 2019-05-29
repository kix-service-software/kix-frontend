import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";
import { SenderType } from "./SenderType";

export class SenderTypeFactory implements IObjectFactory<SenderType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SENDER_TYPE;
    }

    public create(senderType?: SenderType): SenderType {
        return new SenderType(senderType);
    }


}
