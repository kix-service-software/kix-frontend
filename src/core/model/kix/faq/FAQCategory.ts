import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { FAQArticle } from "./FAQArticle";

export class FAQCategory extends KIXObject<FAQCategory> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_CATEGORY;

    public ID: number;
    public Name: string;
    public Comment: string;
    public ParentID: number;
    public GroupIDs: number[];
    public ValidID: number;
    public CreateBy: number;
    public CreateTime: string;
    public ChangeBy: number;
    public ChangeTime: string;

    public SubCategories: FAQCategory[];
    public Articles: FAQArticle[] | number[];

    public constructor(faqCategory: FAQCategory) {
        super();
        if (faqCategory) {
            this.ID = faqCategory.ID;
            this.ObjectId = this.ID;
            this.Name = faqCategory.Name;
            this.Comment = faqCategory.Comment;
            this.ParentID = faqCategory.ParentID;
            this.GroupIDs = faqCategory.GroupIDs;
            this.ValidID = faqCategory.ValidID;
            this.CreateBy = faqCategory.CreateBy;
            this.CreateTime = faqCategory.CreateTime;
            this.ChangeBy = faqCategory.ChangeBy;
            this.ChangeTime = faqCategory.ChangeTime;
            this.SubCategories = faqCategory.SubCategories;
            this.Articles = faqCategory.Articles;
        }
    }

    public equals(faqCategory: FAQCategory): boolean {
        return this.ID === faqCategory.ID;
    }


}
