/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { BooleanFormValue } from '../../../../../object-forms/model/FormValues/BooleanFormValue';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';

export class CustomerVisibleFormValue extends BooleanFormValue {

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        if (!this.hint) {
            this.hint = await TranslationService.translate('Translatable#Helptext_Tickets_TicketCreate_CustomerVisible');
        }

        const article = await this.getReferencedArticle();
        if (article) {
            this.value = article?.CustomerVisible;
        }
    }

    private async getReferencedArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        let article: Article = context?.getAdditionalInformation('REFERENCED_ARTICLE');

        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (!article && refArticleId) {
            const refTicketId = context?.getObjectId();
            article = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
        }

        return article;
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], null,
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

}