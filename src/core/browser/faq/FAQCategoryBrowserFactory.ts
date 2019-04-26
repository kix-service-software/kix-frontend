import { IKIXObjectFactory } from '../kix';
import { FAQCategory } from '../../model/kix/faq';

export class FAQCategoryBrowserFactory implements IKIXObjectFactory<FAQCategory> {

    private static INSTANCE: FAQCategoryBrowserFactory;

    public static getInstance(): FAQCategoryBrowserFactory {
        if (!FAQCategoryBrowserFactory.INSTANCE) {
            FAQCategoryBrowserFactory.INSTANCE = new FAQCategoryBrowserFactory();
        }
        return FAQCategoryBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(faqCategory: FAQCategory): Promise<FAQCategory> {
        const newFAQCategory = new FAQCategory(faqCategory);
        return newFAQCategory;
    }

}
