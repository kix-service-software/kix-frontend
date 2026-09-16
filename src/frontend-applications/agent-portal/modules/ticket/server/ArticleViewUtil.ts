/* eslint-disable max-lines-per-function */
/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { HTMLUtil } from '../../../model/HTMLUtil';
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
import fs from 'fs';
import path from 'path';
import juice from 'juice';

export class ArticleViewUtil {

    private static readonly CKEDITOR_CSS_RELPATH = path.join(
        'static', 'thirdparty', 'ckeditor5', 'ckeditor5.css'
    );

    private static ckEditorCss: string | null = null;
    private static ckEditorCssLoadFailed = false;

    private static readonly JUICE_INLINE_OPTIONS = {
        applyStyleTags: true,
        removeStyleTags: true,
        preserveMediaQueries: false,
        preserveFontFaces: false,
        insertPreservedExtraCss: false,
        applyAttributesTableElements: false,
        inlinePseudoElements: false
    };

    // eslint-disable-next-line max-lines-per-function
    public static async getArticleHTMLContent(
        token: string, articleId: number, ticketId: number, reduceContent: boolean, resolveInlineCSS: boolean,
        linesCount?: number, prepareInline: boolean = true, relevantOrganisationID?: number,
        clientRequestId: string = 'ArticleViewUtil'
    ): Promise<string> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes.push(ArticleProperty.ATTACHMENTS, ArticleProperty.PLAIN);
        loadingOptions.query.push(
            ['RelevantOrganisationID', relevantOrganisationID?.toString()],
            ['HTMLBodyAsAttachment', '1']
        );

        const articleResponse = await TicketAPIService.getInstance().loadObjects<Article>(
            token, clientRequestId, KIXObjectType.ARTICLE, [articleId],
            loadingOptions, new ArticleLoadingOptions(ticketId)
        );

        let content = '';
        let isPlainText = false;
        let useKixCss = false;
        if (articleResponse?.objects?.length) {
            const article = new Article(articleResponse.objects[0]);
            useKixCss = article.Channel === 'note';
            if (article.bodyAttachment) {

                content = await this.getHTMLContent(
                    token, ticketId, article, reduceContent, resolveInlineCSS,
                    linesCount, prepareInline, relevantOrganisationID
                );
            } else {
                isPlainText = true;
                content = article.Body
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                content = `<pre style="text-wrap: auto;">${content}</pre>`;
            }
        }

        if (!isPlainText && content) {
            const cleanHTML: any = HTMLUtil.sanitizeContent(content);
            const additionalHeader = cleanHTML?.headers;
            content = cleanHTML?.content;

            // ignore kix styling (not needed in placeholder context, where reduce is used)
            if (!reduceContent) {
                content = HTMLUtil.buildHtmlStructur(content, additionalHeader, useKixCss);
            }
        }
        return content;
    }

    private static async getHTMLContent(
        token: string, ticketId: number, article: Article, reduceContent: boolean, resolveInlineCSS: boolean,
        linesCount?: number, prepareInline: boolean = true, relevantOrganisationID?: number
    ): Promise<string> {

        const attachmentIds = [article.bodyAttachment.ID];

        if (prepareInline) {
            const inlineAttachments = article.getInlineAttachments() || [];
            attachmentIds.push(...inlineAttachments.map((a) => a.ID));
        }

        const attachments = await TicketAPIService.getInstance().loadArticleAttachments(
            token, ticketId, article.ArticleID, attachmentIds, relevantOrganisationID
        ).catch(() => []);

        let content;
        const contentAttachment = attachments?.length ?
            attachments.find((a) => a.ID === article.bodyAttachment.ID) : null;
        if (contentAttachment) {
            content = this.getContent(contentAttachment);
        } else {
            content = article.Body.replace(/(\r\n|\n\r|\n|\r)/g, '<br />\n');
        }

        if (resolveInlineCSS) {
            content = await this.replaceInlineStyle(content);
        }

        if (reduceContent) {
            content = await this.reduceContent(content, linesCount);
        }

        if (prepareInline && attachments?.length) {
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

        const content = buffer.toString('utf8');
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
            const missingQuotationRegexp = new RegExp('src=(?!["\'])(cid:[^\s\/\>\"\']+)', 'g');
            newString = newString.replace(missingQuotationRegexp, 'src="$1"');
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

    public static async reduceContent(result: string, linesCount?: number): Promise<string> {
        if (linesCount === null) {
            const response = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                ConfigurationService.getBackendAPIToken(), 'ArticleViewUtil', KIXObjectType.SYS_CONFIG_OPTION,
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

            // cut also default kix style content
            const closingStyleIndex = result.indexOf('</style>');
            if (closingStyleIndex !== -1) {
                preBodyHTML += result.slice(0, closingStyleIndex + 8);
                result = result.slice(closingStyleIndex + 8);
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

    public static async prepareArticleBody(body: string, application?: string): Promise<string> {
        const configurationId = application?.toLowerCase() === 'ssp'
            ? 'self-service-portal-configuration'
            : 'agent-portal-configuration';

        let config = await SysConfigService.getInstance().getSysConfigOptionValue(
            ConfigurationService.getBackendAPIToken(), configurationId
        ).catch(() => null);

        let editorType = 'ckeditor5';
        if (config) {
            config = JSON.parse(config);
            editorType = config?.editorType?.toLowerCase() || editorType;

            if (!['tiptap', 'ckeditor5'].includes(editorType)) {
                editorType = 'ckeditor5';
            }
        }

        if (editorType === 'ckeditor5' && body) {
            const ckEditorCss = await ArticleViewUtil.getCKEditorCss();

            if (ckEditorCss) {
                // wrap so the .ck-content-scoped selectors of the editor CSS match;
                // unwrap after inlining to keep the original body structure
                const wrapped = `<div class="ck-content">${body}</div>`;
                try {
                    body = juice.inlineContent(wrapped, ckEditorCss, ArticleViewUtil.JUICE_INLINE_OPTIONS);
                    body = body.replace(/^<div class="ck-content"[^>]*>/, '').replace(/<\/div>\s*$/, '');
                } catch (e) {
                    LoggingService.getInstance().error('Error inlining CKEditor CSS.', e);
                    body = ArticleViewUtil.inlineWithMailStyle(body);
                }
            } else {
                // fallback: previous behaviour if CSS file is not available
                body = ArticleViewUtil.inlineWithMailStyle(body);
            }

            const cleanHTML = HTMLUtil.sanitizeContent(body, false, true);
            body = cleanHTML?.content || body;
        }

        return body;
    }

    private static inlineWithMailStyle(body: string): string {
        try {
            return juice(Article.MAIL_STYLE + body);
        } catch (e) {
            LoggingService.getInstance().error('Error resolving inline css (MAIL_STYLE fallback).', e);
            return body;
        }
    }

    public static async replaceInlineStyle(content: string, create: boolean = false): Promise<string> {
        let error = '';
        try {
            content = juice(content);
        } catch (e) {
            LoggingService.getInstance().error('Error resolving inline css.', e);
            LoggingService.getInstance().error(e);
            error = 'Possible invalid HTML/CSS in source mail.';
        }

        const openingBodyIndexStart = content.indexOf('<body');
        if (openingBodyIndexStart !== -1) {
            const openingBodyIndexEnd = content.indexOf('>', openingBodyIndexStart);
            const closingBodyIndex = content.indexOf('</body>');
            if (
                openingBodyIndexEnd !== -1
                && closingBodyIndex !== -1
            ) {
                content = content.slice(openingBodyIndexEnd + 1, closingBodyIndex);
            }
        }

        if (error && !create) {
            content = `<b style=\"color:red\">${error}</b>${content}`;
        }

        return content;
    }

    private static async getCKEditorCss(): Promise<string | null> {
        if (ArticleViewUtil.ckEditorCss !== null || ArticleViewUtil.ckEditorCssLoadFailed) {
            return ArticleViewUtil.ckEditorCss;
        }

        const candidates = [
            path.resolve(process.cwd(), ArticleViewUtil.CKEDITOR_CSS_RELPATH),
            path.resolve(__dirname, '..', '..', '..', '..', '..', ArticleViewUtil.CKEDITOR_CSS_RELPATH)
        ];

        for (const cssPath of candidates) {
            try {
                const rawCss = await fs.promises.readFile(cssPath, 'utf8');
                ArticleViewUtil.ckEditorCss = ArticleViewUtil.prepareCKEditorCss(rawCss);
                return ArticleViewUtil.ckEditorCss;
            } catch (e) {
                LoggingService.getInstance().error(`CKEditor CSS not readable at ${cssPath}.`, e);
            }
        }

        ArticleViewUtil.ckEditorCssLoadFailed = true;
        return null;
    }

    private static prepareCKEditorCss(css: string): string {
        // 1. collect custom properties, drop :root blocks (juice cannot inline them)
        const variables = new Map<string, string>();
        css = css.replace(/:root\s*\{([^{}]*)\}/g, (_match, block: string) => {
            const declarationRegex = /(--[\w-]+)\s*:\s*([^;]+)/g;
            let declaration = declarationRegex.exec(block);
            while (declaration !== null) {
                variables.set(declaration[1], declaration[2].trim());
                declaration = declarationRegex.exec(block);
            }
            return '';
        });

        // 2. resolve var(...) usage (variables may reference other variables)
        const resolveValue = (value: string, depth = 0): string => {
            if (depth > 8 || !value.includes('var(')) {
                return value;
            }
            return value.replace(
                /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g,
                (_match, name: string, fallback?: string) => {
                    const defined = variables.get(name);
                    if (defined !== undefined) {
                        return resolveValue(defined, depth + 1);
                    }
                    return fallback !== undefined ? resolveValue(fallback.trim(), depth + 1) : 'inherit';
                }
            );
        };
        css = css.replace(/var\([^)]*\)/g, (match) => resolveValue(match));

        // 3. drop at-rule blocks useless for inline styling
        css = css.replace(/@(?:media|keyframes|font-face)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');

        // 4. keep only content-relevant rules
        const contentRules: string[] = [];
        const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
        let rule = ruleRegex.exec(css);
        while (rule !== null) {
            if (rule[1].includes('.ck-content')) {
                contentRules.push(`${rule[1].trim()}{${rule[2]}}`);
            }
            rule = ruleRegex.exec(css);
        }

        return contentRules.join('\n');
    }
}