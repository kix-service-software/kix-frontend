import { FAQArticle } from "./FAQArticle";

export class FAQArticleFactory {

    public static create(faqArticle: FAQArticle): FAQArticle {
        const faqArtile = new FAQArticle(faqArticle);
        return faqArtile;
    }

}
