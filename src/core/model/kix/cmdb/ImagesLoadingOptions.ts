import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class ImagesLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'ImagesLoadingOptions';

    public constructor(
        public configItemId: number
    ) {
        super();
    }

}
