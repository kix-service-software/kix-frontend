import { IKIXObjectFactory } from '../kix';
import { FAQArticle, FAQArticleFactory } from '../../model/kix/faq';
import { ObjectDataService } from '../ObjectDataService';

export class FAQArticleBrowserFactory implements IKIXObjectFactory<FAQArticle> {

    private static INSTANCE: FAQArticleBrowserFactory;

    public static getInstance(): FAQArticleBrowserFactory {
        if (!FAQArticleBrowserFactory.INSTANCE) {
            FAQArticleBrowserFactory.INSTANCE = new FAQArticleBrowserFactory();
        }
        return FAQArticleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(faqArticle: FAQArticle): Promise<FAQArticle> {
        const newFAQArticle = FAQArticleFactory.create(faqArticle);
        this.mapUserData(newFAQArticle);
        return newFAQArticle;
    }

    private mapUserData(faqArticle: FAQArticle): void {
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            faqArticle.createdBy = objectData.users.find((u) => u.UserID === faqArticle.CreatedBy);
            faqArticle.changedBy = objectData.users.find((u) => u.UserID === faqArticle.CreatedBy);
        }
    }
}
