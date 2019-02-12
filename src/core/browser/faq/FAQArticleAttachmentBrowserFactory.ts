import { IKIXObjectFactory } from '../kix';
import { Attachment } from '../../model/kix/faq';

export class FAQArticleAttachmentBrowserFactory implements IKIXObjectFactory<Attachment> {

    private static INSTANCE: FAQArticleAttachmentBrowserFactory;

    public static getInstance(): FAQArticleAttachmentBrowserFactory {
        if (!FAQArticleAttachmentBrowserFactory.INSTANCE) {
            FAQArticleAttachmentBrowserFactory.INSTANCE = new FAQArticleAttachmentBrowserFactory();
        }
        return FAQArticleAttachmentBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(attachment: Attachment): Promise<Attachment> {
        const newFAQArticle = new Attachment(attachment);
        return newFAQArticle;
    }

}
