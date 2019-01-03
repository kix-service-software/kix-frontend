import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class SenderType extends KIXObject<SenderType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.SENDER_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(senderType?: SenderType) {
        super();
        if (senderType) {
            this.ID = senderType.ID;
            this.ObjectId = this.ID;
            this.Name = senderType.Name;
        }
    }

    public equals(senderType: SenderType): boolean {
        return this.ID === senderType.ID;
    }

}
