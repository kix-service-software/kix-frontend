import { ComponentState } from './ComponentState';
import { TicketService } from '../../../core/browser/ticket';
import { Article, KIXObjectType, KIXObjectLoadingOptions } from '../../../core/model';
import { KIXObjectService } from "../../../core/browser";
import { InlineContent } from '../../../core/browser/components';

class Component {

    private state: ComponentState;

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.article = input.article;
        this.prepareContent();
    }


    public async prepareContent(): Promise<void> {
        if (this.article) {
            if (this.article.bodyAttachment) {
                const AttachmentWithContent = await TicketService.getInstance().loadArticleAttachment(
                    this.article.TicketID, this.article.ArticleID, this.article.bodyAttachment.ID
                );

                const inlineAttachments = this.article.Attachments.filter((a) => a.Disposition === 'inline');
                for (const inlineAttachment of inlineAttachments) {
                    const attachment = await TicketService.getInstance().loadArticleAttachment(
                        this.article.TicketID, this.article.ArticleID, inlineAttachment.ID
                    );
                    if (attachment) {
                        inlineAttachment.Content = attachment.Content;
                    }
                }

                const inlineContent: InlineContent[] = [];
                inlineAttachments.forEach(
                    (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
                );
                this.state.inlineContent = inlineContent;
                this.state.content = new Buffer(AttachmentWithContent.Content, 'base64').toString('utf8');
            } else {
                this.state.content = this.article.Body;
            }
        }
    }
}

module.exports = Component;
