import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ArticleType extends KIXObject<ArticleType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.ARTICLE_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(articleType?: ArticleType) {
        super();
        if (articleType) {
            this.ID = articleType.ID;
            this.ObjectId = this.ID;
            this.Name = articleType.Name;
        }
    }

    public equals(articleType: ArticleType): boolean {
        return this.ID === articleType.ID;
    }

}
