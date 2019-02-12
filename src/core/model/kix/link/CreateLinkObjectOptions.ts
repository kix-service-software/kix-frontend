import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { KIXObject } from "../KIXObject";

export class CreateLinkObjectOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public rootObject: KIXObject
    ) {
        super();
    }

}
