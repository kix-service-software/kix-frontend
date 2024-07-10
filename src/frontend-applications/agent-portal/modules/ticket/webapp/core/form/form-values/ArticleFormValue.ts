/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Article } from '../../../../model/Article';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { Ticket } from '../../../../model/Ticket';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ChannelFormValue } from './ChannelFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';

export class ArticleFormValue extends ObjectFormValue<Article[]> {

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, null, objectValueMapper, parent);

        let article: Article;

        const context = ContextService.getInstance().getActiveContext();
        const updateArticleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');

        const hasArticles = ticket.Articles?.length > 0;
        if (hasArticles) {
            if (updateArticleId) {
                article = ticket.Articles.find((a) => a.ArticleID === updateArticleId);
            } else {
                article = ticket.Articles.find((a) => !a.ArticleID);
            }
        } else {
            ticket.Articles = [];
        }

        if (!article) {
            article = new Article(null, ticket);
            article.ArticleID = updateArticleId;
            ticket.Articles.push(article);
        }

        this.object = article;
        this.createBindings(property, article);

        this.formValues.push(new ChannelFormValue(ArticleProperty.CHANNEL_ID, article, objectValueMapper, this));

        this.enabled = true;

        this.visible = false;
    }

}