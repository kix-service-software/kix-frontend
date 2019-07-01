import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class FAQVisibility extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_VISIBILITY;

    public constructor(
        public id: string,
        public name: string
    ) {
        super();
    }

}
