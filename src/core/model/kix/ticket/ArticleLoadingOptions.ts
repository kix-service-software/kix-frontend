import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class ArticleLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'ArticleLoadingOptions';

    public constructor(
        public ticketId: string | number
    ) {
        super();
    }

}
