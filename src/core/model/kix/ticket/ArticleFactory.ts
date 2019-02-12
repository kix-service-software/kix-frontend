import { Article } from './Article';

export class ArticleFactory {

    public static create(article: Article): Article {
        return new Article(article);
    }

}
