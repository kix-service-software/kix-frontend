import { LoggingService } from '../../../../../server/services/LoggingService';
import { Attachment } from '../../../model/kix/Attachment';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { InlineContent } from '../../base-components/webapp/core/InlineContent';
import { Article } from '../model/Article';
import { ArticleLoadingOptions } from '../model/ArticleLoadingOptions';
import { ArticleProperty } from '../model/ArticleProperty';
import { TicketAPIService } from './TicketService';

export class ArticleViewUtil {

    public static async getArticleHTMLContent(
        token: string, articleId: number, ticketId: number, resolveInlineCSS: boolean
    ): Promise<string> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes.push(ArticleProperty.ATTACHMENTS, ArticleProperty.PLAIN);

        const articleResponse = await TicketAPIService.getInstance().loadObjects<Article>(
            token, 'ArticleRouter', KIXObjectType.ARTICLE, [articleId], loadingOptions, new ArticleLoadingOptions(ticketId)
        );

        let content = '';
        if (articleResponse?.objects?.length) {
            const article = new Article(articleResponse.objects[0]);

            if (article.bodyAttachment) {
                content = await this.getHTMLContent(token, ticketId, article);

                if (resolveInlineCSS) {
                    const juice = require('juice');
                    content = juice(content);
                    const bodyMatch = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
                    if (bodyMatch && bodyMatch.length >= 3) {
                        content = bodyMatch[2];
                    }
                }
            } else {
                content = article.Body.replace(/(\r\n|\n\r|\n|\r)/g, '<br>\n');
            }
        }

        content = this.removeScriptContent(content);

        return content;
    }

    private static async getHTMLContent(token: string, ticketId: number, article: Article): Promise<string> {
        const inlineAttachments = article.getInlineAttachments() || [];

        const attachmentIds = [article.bodyAttachment.ID, ...inlineAttachments.map((a) => a.ID)];
        const attachments = await TicketAPIService.getInstance().loadArticleAttachments(
            token, ticketId, article.ArticleID, attachmentIds
        );

        const contentAttachment = attachments.find((a) => a.ID === article.bodyAttachment.ID);
        let content = this.getContent(contentAttachment);

        let inlineContent = [];
        const inline = attachments?.filter((a) => a.ID !== article.bodyAttachment.ID);
        inlineContent = this.prepareInlineContent(inline);

        content = this.replaceInlineContent(content, inlineContent);
        return content;
    }

    private static getContent(contentAttachment: Attachment): string {
        let buffer = Buffer.from(contentAttachment.Content, 'base64');
        const encoding = contentAttachment.charset ? contentAttachment.charset : 'utf8';
        if (encoding !== 'utf8' && encoding !== 'utf-8') {
            const iconv = require('iconv-lite');
            try {
                buffer = iconv.decode(buffer, encoding);
            } catch (e) {
                // do nothing
            }
        }

        let content = buffer.toString('utf8');
        let htmlContent: string = content;

        if (!contentAttachment.Filename.match(/^file-(1|2|1\.html)$/)) {
            htmlContent = content.replace(/(\r\n|\n\r|\n|\r)/g, '<br>');
        }

        return content;
    }

    private static prepareInlineContent(inlineAttachments: Attachment[]): InlineContent[] {
        const inlineContent: InlineContent[] = [];

        for (const attachment of inlineAttachments) {
            const content = new InlineContent(attachment.ContentID, attachment.Content, attachment.ContentType);
            inlineContent.push(content);
        }

        return inlineContent;
    }

    public static replaceInlineContent(value: string, inlineContent: InlineContent[]): string {
        let newString = value;
        if (inlineContent) {
            for (const contentItem of inlineContent) {
                if (contentItem.contentId && contentItem.contentType) {
                    const contentType = contentItem.contentType.replace(new RegExp('"', 'g'), '\'');
                    const replaceString = `data:${contentType};base64,${contentItem.content}`;
                    const contentIdLength = contentItem.contentId.length - 1;
                    const contentId = contentItem.contentId.substring(1, contentIdLength);
                    const regexpString = new RegExp('cid:' + contentId, 'g');
                    newString = newString.replace(regexpString, replaceString);
                }
            }
        }
        return newString;
    }

    public static removeScriptContent(content: string): string {
        try {
            const jsdom = require('jsdom');
            const { JSDOM } = jsdom;

            const dom = new JSDOM(content);
            const domWindow = dom.window;
            const domDocument = domWindow.document;

            const scriptElements = domDocument.getElementsByTagName('script');
            for (let i = 0; i < scriptElements.length; i++) {
                scriptElements.item(i).remove();
            }

            this.removeListenersFromTags(dom);

            return domDocument.documentElement.innerHTML;
        } catch (e) {
            LoggingService.getInstance().error(e);
        }
    }

    private static removeListenersFromTags(dom: any): void {
        const domWindow = dom.window;
        const domDocument = domWindow.document;

        // try to remove listener and functions
        const allElements = Array.prototype.slice.call(domDocument.querySelectorAll('*'));
        allElements.push(domDocument);
        allElements.push(domWindow);

        const types = [];

        for (let ev in domWindow) {
            if (/^on/.test(ev)) {
                types.push(ev);
            }
        }

        for (const currentElement of allElements) {
            for (const type of types) {
                try {
                    const attribute = currentElement.getAttribute(type);
                    if (attribute) {
                        currentElement.removeAttribute(type);
                    }
                } catch (e) {
                    // do nothing
                }
            }
        }
    }

}