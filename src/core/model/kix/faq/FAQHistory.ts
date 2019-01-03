import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class FAQHistory extends KIXObject<FAQHistory> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

    public ID: number;
    public ArticleID: number;
    public Name: string;
    public CreatedBy: number;
    public Created: string;

    public constructor(faqHistory: FAQHistory) {
        super();
        if (faqHistory) {
            this.ID = faqHistory.ID;
            this.ObjectId = this.ID;
            this.ArticleID = faqHistory.ArticleID;
            this.Name = faqHistory.Name;
            this.Created = faqHistory.Created;
            this.CreatedBy = faqHistory.CreatedBy;
        }
    }

    public equals(faqHistory: FAQHistory): boolean {
        return this.ID === faqHistory.ID;
    }


}
