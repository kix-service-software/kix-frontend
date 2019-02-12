import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class CreateFAQVoteOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public faqArticleId: number
    ) {
        super();
    }

}
