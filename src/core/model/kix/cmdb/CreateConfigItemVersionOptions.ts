import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class CreateConfigItemVersionOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public configItemId: number
    ) {
        super();
    }

}
