/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
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

    public constructor(private ticketId: number, private context: Context, private loadArticleDetails: boolean) { }

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
        loadingOptions.includes = [KIXObjectType.CONTACT, KIXObjectType.OBJECT_ICON];

        if (this.loadArticleDetails) {
            loadingOptions.includes.push(
                ArticleProperty.ATTACHMENTS, ArticleProperty.PLAIN, 'ObjectActions', KIXObjectProperty.DYNAMIC_FIELDS
            );
        }

        loadingOptions.expands = [ArticleProperty.CREATED_BY, ArticleProperty.FROM];

        const articleIds = [...articleIdMap.keys()].sort();
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

    public static async searchArticles(ticketId: number, articleFilter: ArticleFilter): Promise<Article[]> {

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.sortOrder = 'Article.IncomingTime,Article.ID';
        loadingOptions.limit = 0;
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
                    ArticleProperty.SENDER_TYPE, SearchOperator.NOT_EQUALS,
                    FilterDataType.STRING, FilterType.AND, 'external'
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
                    FilterDataType.DATETIME, FilterType.AND,
                    `${articleFilter.filterDate} ${articleFilter.filterDateBefore ? '23:59:59' : '00:00:00'}`
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
        loadingOptions.query.push(['fields', 'Article.ArticleID,Article.TicketID,Article.IncomingTime']);

        const articles: Article[] = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, null, loadingOptions, new ArticleLoadingOptions(ticketId)
        ).catch((): Article[] => []);

        return articles;
    }

    public static async loadArticle(articleId: number, ticketId: number): Promise<Article> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = [
            ArticleProperty.PLAIN, ArticleProperty.ATTACHMENTS, KIXObjectProperty.DYNAMIC_FIELDS
        ];

        const articles = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, [articleId], loadingOptions, new ArticleLoadingOptions(ticketId)
        ).catch((): Article[] => []);

        return articles?.length ? articles[0] : null;
    }

}