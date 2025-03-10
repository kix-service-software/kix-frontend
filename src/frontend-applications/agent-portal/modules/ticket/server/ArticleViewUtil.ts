/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Attachment } from '../../../model/kix/Attachment';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { InlineContent } from '../../base-components/webapp/core/InlineContent';
import { SysConfigKey } from '../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../sysconfig/model/SysConfigOption';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { Article } from '../model/Article';
import { ArticleLoadingOptions } from '../model/ArticleLoadingOptions';
import { ArticleProperty } from '../model/ArticleProperty';
import { TicketAPIService } from './TicketService';

export class ArticleViewUtil {

    public static async getArticleHTMLContent(
        token: string, articleId: number, ticketId: number, reduceContent: boolean, resolveInlineCSS: boolean,
        linesCount?: number, prepareInline: boolean = true
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
                content = await this.getHTMLContent(
                    token, ticketId, article, reduceContent, linesCount, prepareInline
                );

                if (resolveInlineCSS) {
                    let error = '';
                    try {
                        const juice = require('juice');
                        content = juice(content);
                    } catch (e) {
                        LoggingService.getInstance().error('Error resolving inline css.', e);
                        LoggingService.getInstance().error(e);
                        error = 'Possible invalid HTML/CSS in source mail.';
                    }

                    const bodyMatch = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
                    if (bodyMatch && bodyMatch.length >= 3) {
                        content = bodyMatch[2];
                    }

                    if (error) {
                        content = `<b style=\"color:red\">${error}</b>${content}`;
                    }
                }
            } else {
                content = article.Body.replace(/(\r\n|\n\r|\n|\r)/g, '<br>\n');
            }
        }

        content = this.prepareContent(content);

        return content;
    }

    private static async getHTMLContent(
        token: string, ticketId: number, article: Article, reduceContent: boolean,
        linesCount?: number, prepareInline: boolean = true
    ): Promise<string> {

        const attachmentIds = [article.bodyAttachment.ID];

        if (prepareInline) {
            const inlineAttachments = article.getInlineAttachments() || [];
            attachmentIds.push(...inlineAttachments.map((a) => a.ID));
        }

        const attachments = await TicketAPIService.getInstance().loadArticleAttachments(
            token, ticketId, article.ArticleID, attachmentIds
        );

        const contentAttachment = attachments.find((a) => a.ID === article.bodyAttachment.ID);
        let content = this.getContent(contentAttachment);

        if (reduceContent) {
            content = await this.reduceContent(content, linesCount);
        }

        if (prepareInline) {
            let inlineContent = [];
            const inline = attachments?.filter((a) => a.ID !== article.bodyAttachment.ID);
            inlineContent = this.prepareInlineContent(inline);
            content = this.replaceInlineContent(content, inlineContent);
        }
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

        return htmlContent;
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

    public static prepareContent(content: string): string {
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

            const ckEditorLink = domDocument.createElement('link');
            ckEditorLink.rel = 'stylesheet';
            ckEditorLink.href = '/static/thirdparty/ckeditor5/ckeditor5.css';
            domDocument.head.appendChild(ckEditorLink);

            const bootstrapLink = domDocument.createElement('link');
            bootstrapLink.rel = 'stylesheet';
            bootstrapLink.href = '/static/thirdparty/bootstrap-5.3.2/css/bootstrap.min.css';
            domDocument.head.appendChild(bootstrapLink);

            domDocument.body.innerHTML = '<div class="ck ck-content">' + domDocument.body.innerHTML + '</div>';

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

    public static async reduceContent(result: string, linesCount?: number): Promise<string> {
        if (linesCount === null) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const response = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                serverConfig.BACKEND_API_TOKEN, 'ArticleViewUtil', KIXObjectType.SYS_CONFIG_OPTION,
                [`${SysConfigKey.TICKET_PLACEHOLDER_BODYRICHTEXT_LINECOUNT}`],
                null, null
            ).catch((): ObjectResponse<SysConfigOption> => new ObjectResponse());
            linesCount = response?.objects?.length ? Number(response.objects[0].Value) : 0;
        } else {
            // make sure it is a number
            linesCount = Number(linesCount);
        }

        if (!isNaN(linesCount) && linesCount > 0) {
            // cut pre body html (only reduce "visible" content)
            let preBodyHTML = '';
            const closingHeadIndex = result.indexOf('</head>');
            if (closingHeadIndex !== -1) {
                preBodyHTML = result.slice(0, closingHeadIndex + 7);
                result = result.slice(closingHeadIndex + 7);
            }

            const lines = result.split(/\n/);

            if (lines.length > linesCount) {
                result = lines.slice(0, linesCount).join('\n');
                result = this.closeTags(result);
                result += '\n[...]';
            }

            if (preBodyHTML) {
                result = preBodyHTML + result;
                if (result.match(/<html.*?>/) && !result.match('</html>')) {
                    result += '\n</html>';
                }
            }
        }
        return result;
    }

    public static closeTags(body: string): string {

        // get all opening and closing tag names but not self closing ones
        // e.g. <div>, <p class...> but not <br /> or <img src... />
        const ingoreTags = [
            'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        ];
        const startTags = (body.match(/<[^!\/][^>]*?>/g) || [])
            .map((tag) => tag.slice(1, -1))// remove < and >
            .map((tag: string) => tag.replace(/([^\s]+).*/s, '$1'))
            .filter((tag) => !ingoreTags.some((itag) => itag === tag));
        const endTags = (body.match(/<\/.+?>/g) || [])
            .map((tag) => tag.slice(2, -1)) // remove </ and >
            .filter((tag) => !ingoreTags.some((itag) => itag === tag));

        // remove now closed tags (start with last opened - in to out)
        // rember only opening tags with no closing counterpart
        startTags.reverse();
        if (endTags.length) {

            endTags.forEach((tag) => {
                const index = startTags.findIndex((startTag) => startTag === tag);
                if (index !== -1) {
                    startTags.splice(index, 1);
                }
            });
        }

        // add closing tags if needed (start with last, still reversed)
        startTags.forEach((tag) => body += `\n<\/${tag}>`);

        return body;
    }

}