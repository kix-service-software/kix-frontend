import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class SetPreferenceOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public userId: number
    ) {
        super();
    }

}
