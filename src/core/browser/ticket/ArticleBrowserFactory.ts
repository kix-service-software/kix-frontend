import {
    ArticleFactory, Article, SenderType, KIXObjectType,
    ArticleType, ArticleReceiver, ArticleProperty
} from '../../model';
import { IKIXObjectFactory, KIXObjectService } from '../kix';

export class ArticleBrowserFactory implements IKIXObjectFactory<Article> {

    private static INSTANCE: ArticleBrowserFactory;

    public static getInstance(): ArticleBrowserFactory {
        if (!ArticleBrowserFactory.INSTANCE) {
            ArticleBrowserFactory.INSTANCE = new ArticleBrowserFactory();
        }
        return ArticleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(article: Article): Promise<Article> {
        const newArticle = ArticleFactory.create(article);
        await this.mapArticleData(newArticle);
        return newArticle;
    }

    private async mapArticleData(article: Article): Promise<void> {
        const senderTypes = await KIXObjectService.loadObjects<SenderType>(
            KIXObjectType.SENDER_TYPE, [article.SenderTypeID]
        ).catch((error) => []);

        const articleTypes = await KIXObjectService.loadObjects<ArticleType>(
            KIXObjectType.ARTICLE_TYPE, [article.ArticleTypeID]
        ).catch((error) => []);

        article.senderType = senderTypes && senderTypes.length ? senderTypes[0] : null;
        article.articleType = articleTypes && articleTypes.length ? articleTypes[0] : null;

        this.prepareReceiverLists(article);
        if (!article.bodyAttachment) {
            this.prepareAttachments(article);
        }
    }

    private prepareReceiverLists(article: Article): void {
        const toStringList = article.To ? article.To.split(/,\s*/) : [];
        const ccStringList = article.Cc ? article.Cc.split(/,\s*/) : [];
        const bccStringList = article.Bcc ? article.Bcc.split(/,\s*/) : [];
        const toRealNameStringList = article.ToRealname ? article.ToRealname.split(/,\s*/) : [];
        const ccRealNameStringList = article.CcRealname ? article.CcRealname.split(/,\s*/) : [];
        const bccRealNameStringList = article.BccRealname ? article.BccRealname.split(/,\s*/) : [];
        article.toList = toStringList.map((t, index) => new ArticleReceiver(t, toRealNameStringList[index]));
        article.ccList = ccStringList.map(
            (cc, index) => new ArticleReceiver(cc, ccRealNameStringList[index], ArticleProperty.CC)
        );
        article.bccList = bccStringList.map(
            (bcc, index) => new ArticleReceiver(bcc, bccRealNameStringList[index], ArticleProperty.BCC)
        );
    }

    private prepareAttachments(article: Article): void {
        if (article.Attachments) {
            const bodyAttachmentIndex = article.Attachments.findIndex(
                (a) => a.Disposition === 'inline' && a.Filename === 'file-2'
            );
            if (bodyAttachmentIndex > -1) {
                article.bodyAttachment = article.Attachments[bodyAttachmentIndex];
                article.Attachments.splice(bodyAttachmentIndex, 1);
            }
        }
    }

}
