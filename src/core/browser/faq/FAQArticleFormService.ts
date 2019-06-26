import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, KIXObjectLoadingOptions, FormField, CRUD } from "../../model";
import { FAQArticleProperty, FAQArticle, FAQArticleAttachmentLoadingOptions, Attachment } from "../../model/kix/faq";
import { InlineContent } from "../components";
import { KIXObjectService } from "../kix";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";

export class FAQArticleFormService extends KIXObjectFormService<FAQArticle> {

    private static INSTANCE: FAQArticleFormService;

    public static getInstance(): FAQArticleFormService {
        if (!FAQArticleFormService.INSTANCE) {
            FAQArticleFormService.INSTANCE = new FAQArticleFormService();
        }
        return FAQArticleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FAQ_ARTICLE;
    }

    protected async getValue(property: string, value: any, faqArticle: FAQArticle): Promise<any> {
        if (value) {
            switch (property) {
                case FAQArticleProperty.KEYWORDS:
                    if (faqArticle) {
                        value = (value as string[]).join(' ');
                    }
                    break;
                case FAQArticleProperty.FIELD_1:
                case FAQArticleProperty.FIELD_2:
                case FAQArticleProperty.FIELD_3:
                case FAQArticleProperty.FIELD_6:
                    const inlineContent = await this.getInlineContent(faqArticle);
                    value = this.replaceInlineContent(faqArticle[property], inlineContent);
                    break;
                case FAQArticleProperty.ATTACHMENTS:
                    value = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
                    break;
                default:
            }
        }
        return value;
    }

    private async getInlineContent(faqArticle: FAQArticle): Promise<InlineContent[]> {
        const inlineContent: InlineContent[] = [];
        if (faqArticle.Attachments) {
            const inlineAttachments = faqArticle.Attachments.filter((a) => a.Disposition === 'inline');
            for (const attachment of inlineAttachments) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['Content']);
                const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
                    faqArticle.ID, attachment.ID
                );
                const attachments = await KIXObjectService.loadObjects<Attachment>(
                    KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions,
                    faqArticleAttachmentOptions
                );
                for (const attachmentItem of attachments) {
                    if (attachment.ID === attachmentItem.ID) {
                        attachment.Content = attachmentItem.Content;
                    }
                }
            }

            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );
        }
        return inlineContent;
    }

    public async hasPermissions(field: FormField): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case FAQArticleProperty.CATEGORY_ID:
                hasPermissions = await this.checkPermissions('system/faq/categories');
                break;
            case FAQArticleProperty.ATTACHMENTS:
                hasPermissions = await this.checkPermissions('faq/articles/*/attachments', [CRUD.CREATE]);
                break;
            case FAQArticleProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            default:
        }
        return hasPermissions;
    }

    private async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }

}
