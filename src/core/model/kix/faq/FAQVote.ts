import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class FAQVote extends KIXObject<FAQVote> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_VOTE;

    public ID: number;
    public ArticleID: number;
    public CreatedBy: string;
    public IPAddress: string;
    public Interface: string;
    public Rating: number;
    public Created: string;

    public constructor(faqVote?: FAQVote) {
        super();
        if (faqVote) {
            this.ID = Number(faqVote.ID);
            this.ObjectId = this.ID;
            this.ArticleID = faqVote.ArticleID;
            this.IPAddress = faqVote.IPAddress;
            this.Interface = faqVote.Interface;
            this.Rating = Number(faqVote.Rating);
            this.CreatedBy = faqVote.CreatedBy;
            this.Created = faqVote.Created;
        }
    }

    public equals(faqVote: FAQVote): boolean {
        return this.ID === faqVote.ID;
    }


}
