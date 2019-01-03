import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { Attachment } from "./Attachment";
import { FAQHistory } from "./FAQHistory";
import { FAQVote } from "./FAQVote";
import { User } from "../user";
import { Link } from "../link";

export class FAQArticle extends KIXObject<FAQArticle> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public ID: number;
    public Title: string;
    public CategoryID: number;
    public Visibility: string;
    public Language: string;
    public ContentType: string;
    public Number: string;
    public Keywords: string[];
    public Field1: string;
    public Field2: string;
    public Field3: string;
    public Field4: string;
    public Field5: string;
    public Field6: string;
    public Approved: number;
    public ValidID: number;
    public CreatedBy: number;
    public Created: string;
    public ChangedBy: number;
    public Changed: string;

    public Attachments: Attachment[];
    public History: FAQHistory[];
    public Votes: FAQVote[];

    public createdBy: User;
    public changedBy: User;

    public constructor(faqArticle: FAQArticle) {
        super();
        if (faqArticle) {
            this.ID = faqArticle.ID;
            this.ObjectId = faqArticle.ID;
            this.Title = faqArticle.Title;
            this.CategoryID = faqArticle.CategoryID;
            this.Visibility = faqArticle.Visibility;
            this.Language = faqArticle.Language;
            this.ContentType = faqArticle.ContentType;
            this.Number = faqArticle.Number;
            this.Keywords = faqArticle.Keywords;
            this.Field1 = faqArticle.Field1;
            this.Field2 = faqArticle.Field2;
            this.Field3 = faqArticle.Field3;
            this.Field4 = faqArticle.Field4;
            this.Field5 = faqArticle.Field5;
            this.Field6 = faqArticle.Field6;
            this.Approved = faqArticle.Approved;
            this.ValidID = Number(faqArticle.ValidID);
            this.CreatedBy = faqArticle.CreatedBy;
            this.Created = faqArticle.Created;
            this.ChangedBy = faqArticle.ChangedBy;
            this.Changed = faqArticle.Changed;

            this.LinkTypeName = faqArticle.LinkTypeName;
            this.Attachments = faqArticle.Attachments ? faqArticle.Attachments.map((a) => new Attachment(a)) : [];
            this.History = faqArticle.History ? faqArticle.History.map((h) => new FAQHistory(h)) : [];
            this.Votes = faqArticle.Votes ? faqArticle.Votes.map((v) => new FAQVote(v)) : [];
            this.Links = faqArticle.Links ? faqArticle.Links.map((l) => new Link(l)) : [];

            this.createdBy = faqArticle.createdBy;
            this.changedBy = faqArticle.changedBy;
        }

    }

    public equals(faqArticle: FAQArticle): boolean {
        return faqArticle.ID === this.ID;
    }
}
