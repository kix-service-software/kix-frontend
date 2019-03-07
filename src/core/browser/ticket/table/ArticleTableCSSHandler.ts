import { ITableCSSHandler, TableValue } from "../../table";
import { Article, ArticleProperty } from "../../../model";

export class ArticleTableCSSHandler implements ITableCSSHandler<Article> {

    public getRowCSSClasses(article: Article): string[] {
        const classes = [];

        if (article) {
            if (article.isUnread()) {
                classes.push("article-unread");
            }
        }

        return classes;
    }

    public getValueCSSClasses(article: Article, value: TableValue): string[] {
        const classes = [];
        switch (value.property) {
            case ArticleProperty.ARTICLE_INFORMATION:
                classes.push('unseen');
                break;
            default:
        }
        return classes;
    }

}
