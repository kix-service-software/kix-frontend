import { Article } from './Article';
import { IObjectFactory } from '../IObjectFactory';
import { KIXObjectType } from '../KIXObjectType';

export class ArticleFactory implements IObjectFactory<Article> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ARTICLE;
    }

    public create(article: Article): Article {
        return new Article(article);
    }

}
