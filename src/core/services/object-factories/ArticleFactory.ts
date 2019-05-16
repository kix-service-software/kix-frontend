import { ObjectFactory } from "./ObjectFactory";
import { Article, KIXObjectType } from "../../model";

export class ArticleFactory extends ObjectFactory<Article> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ARTICLE;
    }

    public create(article: Article): Article {
        return new Article(article);
    }

}
