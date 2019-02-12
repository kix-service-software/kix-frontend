import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class ObjectIconLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'ObjectIconLoadingOptions';

    public constructor(
        public object: string,
        public objectId: string | number
    ) {
        super();
    }

}
