import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class ArticlesLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'ArticlesLoadingOptions';

    public constructor(
        public ticketId: number,
        public latest: boolean = true,
        public first: boolean = false
    ) {
        super();
    }

}
