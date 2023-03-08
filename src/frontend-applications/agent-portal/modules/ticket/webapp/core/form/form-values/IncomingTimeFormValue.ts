/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { DateTimeFormValue } from '../../../../../object-forms/model/FormValues/DateTimeFormValue';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';

export class IncomingTimeFormValue extends DateTimeFormValue {

    public async initFormValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        let value: Date;
        const refArticleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');
        if (refArticleId) {
            const refTicketId = context?.getObjectId();
            const refArticle = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
            if (refArticle) {
                const date = new Date(Number(refArticle.IncomingTime) * 1000);
                value = date;
            }
        }
        return super.setFormValue(value);
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
