/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';

export class CustomerVisibleFormValue extends BooleanFormValue {

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        const context = ContextService.getInstance().getActiveContext();
        const refArticleId = context?.getAdditionalInformation('REFERENCED_ARTICLE_ID');
        if (refArticleId) {
            const refTicketId = context?.getObjectId();
            const refArticle = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
            if (refArticle) {
                this.value = refArticle?.CustomerVisible;
            }
        }
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