/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../model/SortUtil';
import { Attachment } from '../../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../../customer/model/Contact';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { User } from '../../../../user/model/User';
import { Article } from '../../../model/Article';
import { ArticleColorsConfiguration } from '../../../model/ArticleColorsConfiguration';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { TicketProperty } from '../../../model/TicketProperty';
import { ArticleFilter } from './ArticleFilter';

export class ArticleLoader {

    private articleIds: Map<number, (article: Article) => void> = new Map();

    private timeout: any;

    private articleColorConfiguration: any;

    public constructor(private ticketId: number, private context: Context) { }

    public queueArticle(articleId: number, cb: (article: Article) => void): void {
        this.articleIds.set(articleId, cb);
        this.load();
    }

    public dequeueArticle(articleId: number): void {
        this.articleIds.delete(articleId);
    }

    private load(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.loadArticles();
        }, 150);
    }

    private async loadArticles(): Promise<void> {
        const articleIdMap = this.articleIds;
        this.articleIds = new Map();

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = [
            ArticleProperty.PLAIN, ArticleProperty.ATTACHMENTS, 'ObjectActions',
            KIXObjectType.CONTACT, KIXObjectType.OBJECT_ICON
        ];
        loadingOptions.expands = [
            ArticleProperty.CREATED_BY, ArticleProperty.FROM
        ];

        const articleIds = [...articleIdMap.keys()];
        const articles = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, articleIds, loadingOptions,
            new ArticleLoadingOptions(this.ticketId)
        ).catch((): Article[] => []);

        for (const a of articles) {
            if (articleIdMap.has(Number(a.ArticleID))) {
                const cb = articleIdMap.get(Number(a.ArticleID));
                cb(a);
            }
        }
    }

    public async prepareArticleActions(article: Article): Promise<AbstractAction[]> {
        const actions = await this.context?.getAdditionalActions(article) || [];

        const hasKIXPro = await KIXModulesService.getInstance().hasPlugin('KIXPro');
        if (!hasKIXPro) {
            const startActions = ['article-reply-action', 'article-forward-action'];
            const actionInstance = await ActionFactory.getInstance().generateActions(
                startActions, article
            );
            actions.push(...actionInstance);
        }

        const plainTextAction = await ActionFactory.getInstance().generateActions(['article-get-plain-action'], article);
        if (plainTextAction?.length) {
            plainTextAction[0].setData(article);
            actions.push(...plainTextAction);
        }

        const printAction = await ActionFactory.getInstance().generateActions(['article-print-action'], article);
        if (printAction?.length) {
            printAction[0].setData(article);
            actions.push(...printAction);
        }

        const filteredActions: AbstractAction[] = [];
        for (const a of actions) {
            if (await a.canShow()) {
                filteredActions.push(a);
            }
        }

        return filteredActions;
    }

    public filterAttachments(article: Article, showAll: boolean): Attachment[] {
        let attachments = (article?.Attachments || []);

        attachments = attachments.filter(
            (a) => !a.Filename.match(/^file-(1|2)$/) &&
                (showAll || a.Disposition !== 'inline')
        );

        attachments.sort((a, b) => {
            if (!showAll) {
                return SortUtil.compareString(a.Filename, b.Filename);
            }

            let result = -1;
            if (a.Disposition === b.Disposition) {
                result = SortUtil.compareString(a.Filename, b.Filename);
            } else if (a.Disposition === 'inline') {
                result = 1;
            }
            return result;
        });
        return attachments;
    }

    public async getContactForArticle(article: Article): Promise<Contact> {
        let contact: Contact;
        if (article?.SenderType === 'external') {
            if (typeof article.From === 'object' && !Array.isArray(article.From)) {
                contact = article.From;
            }
        } else {
            contact = (article.CreatedBy as User)?.Contact;
        }

        return contact;
    }

    public async getChannelColor(channel: string): Promise<string> {
        if (!this.articleColorConfiguration) {
            const options = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [ArticleColorsConfiguration.CONFIGURATION_ID]
            ).catch((): SysConfigOption[] => []);

            if (Array.isArray(options) && options.length) {
                try {
                    this.articleColorConfiguration = JSON.parse(options[0].Value);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        return this.articleColorConfiguration
            ? this.articleColorConfiguration[channel] || this.getFallbackColor(channel)
            : this.getFallbackColor(channel);
    }

    private getFallbackColor(channel: string): string {
        let color = '#fff';

        if (channel === 'note') {
            color = '#fbf7e2';
        } else if (channel === 'email') {
            color = '#e1eaeb';
        }

        return color;
    }

    public static async searchArticles(
        ticketId: number, articleFilter: ArticleFilter
    ): Promise<number[]> {

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [];

        if (articleFilter?.filterExternal) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    ArticleProperty.SENDER_TYPE, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, 'external'
                )
            );
        }

        if (articleFilter?.filterInternal) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    ArticleProperty.SENDER_TYPE, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, 'agent'
                )
            );
        }

        if (articleFilter?.filterCustomer) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    ArticleProperty.CUSTOMER_VISIBLE, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 1
                )
            );
        }

        if (articleFilter?.filterDate) {
            const operator = articleFilter.filterDateBefore
                ? SearchOperator.LESS_THAN_OR_EQUAL
                : SearchOperator.GREATER_THAN_OR_EQUAL;

            loadingOptions.filter.push(
                new FilterCriteria(
                    TicketProperty.ARTICLE_CREATE_TIME, operator,
                    FilterDataType.DATE, FilterType.AND, articleFilter.filterDate
                )
            );
        }

        if (articleFilter.filterUnread) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    'ArticleFlag.Seen', SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, 0
                )
            );
        }

        if (articleFilter.fulltext) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    SearchProperty.FULLTEXT, SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.AND, articleFilter.fulltext
                )
            );
        }

        const useFilter = loadingOptions.filter?.length > 0;

        let articles: Article[] = [];
        if (useFilter) {
            articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, null, loadingOptions, new ArticleLoadingOptions(ticketId)
            ).catch((): Article[] => []);
        }

        return useFilter ? articles?.map((a) => Number(a.ArticleID)) || [] : null;
    }

}