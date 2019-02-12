import { CreateArticle } from './CreateArticle';

export class CreateArticleRequest {

    public Article: CreateArticle;

    public constructor(createArticle: CreateArticle) {
        this.Article = createArticle;
    }

}
