/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Article } from '../../../model/Article';
import { ArticleLoadingOptions } from '../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../model/ArticleProperty';

export class ArticleLoader {

    private articleIds: Map<number, (article: Article) => void> = new Map();

    private timeout: any;

    public constructor(private ticketId: number) { }

    public queueArticle(articleId: number, cb: (article: Article) => void): void {
        this.articleIds.set(articleId, cb);
        this.load();
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

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                ArticleProperty.PLAIN, ArticleProperty.ATTACHMENTS, 'ObjectActions'
            ]
        );

        const articleIds = [...articleIdMap.keys()];
        const articles = await KIXObjectService.loadObjects<Article>(
            KIXObjectType.ARTICLE, articleIds, loadingOptions,
            new ArticleLoadingOptions(this.ticketId)
        ).catch((): Article[] => []);

        articles.forEach((a) => {
            if (articleIdMap.has(Number(a.ArticleID))) {
                const cb = articleIdMap.get(Number(a.ArticleID));
                cb(a);
            }
        });
    }

}