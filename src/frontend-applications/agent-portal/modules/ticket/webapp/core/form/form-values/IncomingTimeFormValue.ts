/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { DateTimeFormValue } from '../../../../../object-forms/model/FormValues/DateTimeFormValue';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';

export class IncomingTimeFormValue extends DateTimeFormValue {

    public async initFormValue(): Promise<void> {
        let value: Date;

        const article = await this.getReferencedArticle();
        if (article) {
            const date = new Date(Number(article.IncomingTime) * 1000);
            value = date;
        }

        this.label = await LabelService.getInstance().getPropertyText(
            ArticleProperty.INCOMING_TIME, KIXObjectType.ARTICLE
        );

        return super.setFormValue(value);
    }

    private async getReferencedArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        let article = context.getAdditionalInformation('REFERENCED_ARTICLE');

        const refArticleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');
        if (!article && refArticleId) {
            const refTicketId = context?.getObjectId();
            article = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
        }

        return article;
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (!isNaN(value)) {
            value = new Date(Number(value));
        }
        return super.setFormValue(value, force);
    }

    public setObjectValue(value: any): Promise<void> {
        if (value) {
            value = DateTimeUtil.getKIXDateTimeString(value);
        }
        return super.setObjectValue(value);
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS]
                ),
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

}
